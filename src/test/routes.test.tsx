import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "@/App";

/** Supabase is stubbed so route smoke tests never hit the network. */
vi.mock("@/integrations/supabase/client", () => {
  const result = Promise.resolve({ data: null, error: null, count: 0 });
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const key of [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "in",
    "order",
    "limit",
    "range",
    "gte",
    "lte",
  ]) {
    builder[key] = vi.fn(chain);
  }
  builder.single = vi.fn(() => result);
  builder.maybeSingle = vi.fn(() => result);
  builder.then = (...args: unknown[]) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result as any).then(...args);

  return {
    supabase: {
      from: vi.fn(() => builder),
      auth: {
        getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(() => Promise.resolve({ error: null })),
      },
      functions: { invoke: vi.fn(() => Promise.resolve({ data: null, error: null })) },
      storage: { from: vi.fn(() => ({ upload: vi.fn(), remove: vi.fn() })) },
    },
  };
});

const renderRoute = (path: string) => {
  window.history.pushState({}, "", path);
  return render(<App />);
};

const ROUTES = [
  "/",
  "/pricing",
  "/docs",
  "/about",
  "/contact",
  "/auth",
  "/solutions/chat-agent",
  "/app/onboarding",
];

describe("route smoke tests", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it.each(ROUTES)("renders %s without crashing", async (path) => {
    renderRoute(path);
    // Chrome always renders the shared layout header + footer nav.
    await waitFor(() => expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0));
    // The global error boundary fallback must not be showing.
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });

  it("renders the 404 page for an unknown route", async () => {
    renderRoute("/this-route-does-not-exist");
    await waitFor(() => expect(screen.getByText("404")).toBeInTheDocument());
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });

  it("keeps primary navigation links pointing at real routes", async () => {
    renderRoute("/");
    await waitFor(() => expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0));

    const hrefs = Array.from(document.querySelectorAll("a[href^='/']")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs.length).toBeGreaterThan(0);

    const known = [
      /^\/$/,
      /^\/pricing$/,
      /^\/docs$/,
      /^\/about$/,
      /^\/contact$/,
      /^\/auth$/,
      /^\/account$/,
      /^\/shop$/,
      /^\/checkout$/,
      /^\/order-success$/,
      /^\/product\/[^/]+$/,
      /^\/solutions\/[^/]+$/,
      /^\/admin(\/(agent|analytics))?$/,
      /^\/app(\/(onboarding|leads|training|integration|channels))?$/,
    ];

    const unknown = hrefs.filter((href) => !known.some((re) => re.test(href ?? "")));
    expect(unknown).toEqual([]);
  });
});
