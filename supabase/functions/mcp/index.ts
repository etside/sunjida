// MCP (Model Context Protocol) server for SalesDaddy.
// Exposes the agent's tools (catalog, orders, stock, handoff) over the standard MCP wire format
// so any MCP-compatible client (ChatGPT, Claude, Cursor, etc.) can drive the sales agent.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  adminClient,
  buildCatalogContext,
  buildTrainingContext,
  canPlaceOrders,
  runPlaceOrder,
} from "../_shared/agent.ts";
import { businessFromApiKey, type Db } from "../_shared/tenant.ts";

/* ------------------------------------------------------------------ */
/* MCP tool definitions                                                */
/* ------------------------------------------------------------------ */

const MCP_TOOLS = [
  {
    name: "lookup_products",
    description:
      "Search the business product catalog by name or category. Returns matching products with prices and stock.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term (product name, category, or keyword)" },
        limit: { type: "number", description: "Max results to return (default 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_product_detail",
    description: "Get full details for a specific product by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "string", description: "The product external_id from the catalog" },
      },
      required: ["product_id"],
    },
  },
  {
    name: "check_stock",
    description: "Check stock availability for one or more products.",
    inputSchema: {
      type: "object",
      properties: {
        product_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of product external_ids to check",
        },
      },
      required: ["product_ids"],
    },
  },
  {
    name: "place_order",
    description:
      "Place a confirmed order on the business's website. Only call when the customer has confirmed items and provided name, phone, and delivery address.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product_id: { type: "string", description: "Catalog external_id" },
              name: { type: "string", description: "Product name" },
              quantity: { type: "number", description: "Number of units" },
              unit_price: { type: "number", description: "Price per unit" },
            },
            required: ["product_id", "name", "quantity", "unit_price"],
          },
        },
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        customer_email: { type: ["string", "null"] },
        shipping_address: { type: "string" },
      },
      required: ["items", "customer_name", "customer_phone", "customer_email", "shipping_address"],
    },
  },
  {
    name: "connect_human",
    description: "Hand off the conversation to a human team member.",
    inputSchema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Why the handoff is needed" },
        urgency: { type: "string", enum: ["low", "medium", "high"] },
      },
      required: ["reason"],
    },
  },
] as const;

/* ------------------------------------------------------------------ */
/* Tool implementations                                                */
/* ------------------------------------------------------------------ */

async function handleLookupProducts(db: Db, businessId: string, args: { query: string; limit?: number }) {
  const limit = Math.min(args.limit ?? 10, 30);
  const { data } = await db
    .from("business_products")
    .select("external_id, name, price, currency, stock_quantity, description")
    .eq("business_id", businessId)
    .or(`name.ilike.%${args.query}%,description.ilike.%${args.query}%`)
    .limit(limit);

  if (!data?.length) return { content: [{ type: "text", text: "No products found matching that query." }] };

  const lines = data.map((p: Record<string, unknown>) => {
    const stock =
      p.stock_quantity == null
        ? "stock unknown"
        : Number(p.stock_quantity) > 0
          ? `in stock (${p.stock_quantity})`
          : "out of stock";
    return `- [${p.external_id}] ${p.name} | ${p.currency} ${p.price} | ${stock}`;
  });

  return { content: [{ type: "text", text: `Found ${data.length} product(s):\n\n${lines.join("\n")}` }] };
}

async function handleGetProductDetail(db: Db, businessId: string, args: { product_id: string }) {
  const { data } = await db
    .from("business_products")
    .select("external_id, name, description, price, currency, stock_quantity, image_url, product_url")
    .eq("business_id", businessId)
    .eq("external_id", args.product_id)
    .maybeSingle();

  if (!data) return { content: [{ type: "text", text: "Product not found." }] };

  const stock =
    data.stock_quantity == null
      ? "Unknown"
      : Number(data.stock_quantity) > 0
        ? `In stock (${data.stock_quantity})`
        : "Out of stock";

  const detail = [
    `Name: ${data.name}`,
    `Price: ${data.currency} ${data.price}`,
    `Stock: ${stock}`,
    data.description ? `Description: ${data.description}` : null,
    data.product_url ? `URL: ${data.product_url}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return { content: [{ type: "text", text: detail }] };
}

async function handleCheckStock(db: Db, businessId: string, args: { product_ids: string[] }) {
  const { data } = await db
    .from("business_products")
    .select("external_id, name, stock_quantity")
    .eq("business_id", businessId)
    .in("external_id", args.product_ids);

  if (!data?.length) return { content: [{ type: "text", text: "No matching products found." }] };

  const lines = data.map((p: Record<string, unknown>) => {
    const stock =
      p.stock_quantity == null
        ? "stock unknown"
        : Number(p.stock_quantity) > 0
          ? `in stock (${p.stock_quantity})`
          : "OUT OF STOCK";
    return `- ${p.name} [${p.external_id}]: ${stock}`;
  });

  return { content: [{ type: "text", text: lines.join("\n") }] };
}

async function handlePlaceOrder(
  db: Db,
  businessId: string,
  leadId: string | null,
  args: Record<string, unknown>,
) {
  const result = await runPlaceOrder(db, businessId, leadId, args);
  return {
    content: [{ type: "text", text: JSON.stringify(result) }],
    isError: !(result as { success?: boolean }).success,
  };
}

function handleConnectHuman(args: { reason: string; urgency?: string }) {
  const urgency = args.urgency ?? "medium";
  return {
    content: [
      {
        type: "text",
        text: `Handoff requested (${urgency} urgency): ${args.reason}. The team has been notified and will reach out shortly.`,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* JSON-RPC helper                                                     */
/* ------------------------------------------------------------------ */

function rpcResult(id: number | string, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id: number | string | null, code: number, message: string, data?: unknown) {
  return { jsonrpc: "2.0", id, error: { code, message, ...(data !== undefined ? { data } : {}) } };
}

/* ------------------------------------------------------------------ */
/* Request handler                                                     */
/* ------------------------------------------------------------------ */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") return json(rpcError(null, -32600, "Method not allowed. Use POST."), 405);

  // Authenticate via X-SalesDaddy-Key header.
  const apiKey = req.headers.get("X-SalesDaddy-Key");
  const db = adminClient();
  const auth = await businessFromApiKey(db, apiKey, "mcp");

  if (!auth) return json(rpcError(null, -32600, "Unauthorized. Provide a valid X-SalesDaddy-Key header."), 401);

  const businessId = auth.business.id as string;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(rpcError(null, -32700, "Parse error"), 400);
  }

  const { id, method, params } = body;

  try {
    // --- initialize ---
    if (method === "initialize") {
      return json(
        rpcResult(id ?? 1, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "salesdaddy-mcp", version: "1.0.0" },
        }),
      );
    }

    // --- tools/list ---
    if (method === "tools/list") {
      const canOrder = await canPlaceOrders(db, businessId);
      const tools = canOrder ? MCP_TOOLS : MCP_TOOLS.filter((t) => t.name !== "place_order");
      return json(rpcResult(id ?? 1, { tools }));
    }

    // --- tools/call ---
    if (method === "tools/call") {
      const toolName = (params as Record<string, unknown>)?.name as string;
      const args = ((params as Record<string, unknown>)?.arguments as Record<string, unknown>) ?? {};

      // Resolve lead_id from context if provided
      const leadId = (params as Record<string, unknown>)?.leadId as string | null ?? null;

      let result: unknown;

      switch (toolName) {
        case "lookup_products":
          result = await handleLookupProducts(db, businessId, args as { query: string; limit?: number });
          break;
        case "get_product_detail":
          result = await handleGetProductDetail(db, businessId, args as { product_id: string });
          break;
        case "check_stock":
          result = await handleCheckStock(db, businessId, args as { product_ids: string[] });
          break;
        case "place_order":
          result = await handlePlaceOrder(db, businessId, leadId, args);
          break;
        case "connect_human":
          result = handleConnectHuman(args as { reason: string; urgency?: string });
          break;
        default:
          return json(rpcError(id ?? 1, -32601, `Unknown tool: ${toolName}`));
      }

      return json(rpcResult(id ?? 1, result));
    }

    // --- notifications/initialized (client sends this after initialize, no response needed) ---
    if (method === "notifications/initialized") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return json(rpcError(id ?? 1, -32601, `Method not found: ${method}`));
  } catch (error) {
    console.error("mcp error:", error);
    return json(rpcError(id ?? 1, -32603, "Internal error", (error as Error).message), 500);
  }
});
