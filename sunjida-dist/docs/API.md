# API Documentation

## Base URL

```
https://salesdaddy.torquesticker.com/api/v1
```

## Authentication

All API endpoints (except webhook and health) require JWT authentication.

```http
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login

Login with email and password.

**Request:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe"
    }
}
```

#### POST /auth/register

Register a new user.

**Request:**
```json
{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "John Doe"
}
```

#### POST /auth/logout

Logout current user (requires authentication).

---

### Shops

#### POST /shops/create

Create a new shop.

**Request:**
```json
{
    "name": "My Shop",
    "description": "Best products ever",
    "category": "retail",
    "website": "https://myshop.com"
}
```

#### POST /shops/update

Update shop details.

**Request:**
```json
{
    "shop_id": 1,
    "name": "Updated Shop Name",
    "description": "New description"
}
```

#### GET /shops/connect-meta

Initiate Meta OAuth flow. Returns OAuth URL.

**Query Parameters:**
- `shop_id` - Shop ID to connect

---

### Products

#### POST /products/sync

Sync products from Meta Commerce.

**Request:**
```json
{
    "shop_id": 1,
    "products": [
        {
            "sku": "PROD-001",
            "name": "Product Name",
            "description": "Product description",
            "price": 29.99,
            "stock_quantity": 100
        }
    ]
}
```

#### POST /products/search

Search products using semantic search.

**Request:**
```json
{
    "shop_id": 1,
    "query": "carbon fiber wrap",
    "limit": 10
}
```

**Response:**
```json
{
    "results": [
        {
            "id": 1,
            "name": "Carbon Fiber Vinyl Wrap",
            "description": "Premium carbon fiber texture...",
            "price": 89.99,
            "sku": "CF-001",
            "similarity": 0.92
        }
    ]
}
```

---

### Inventory

#### POST /inventory/update

Update product inventory.

**Request:**
```json
{
    "product_id": 1,
    "quantity": 150
}
```

---

### Conversations

#### GET /conversations/list

List all conversations for a shop.

**Query Parameters:**
- `shop_id` - Shop ID
- `status` - Filter by status (active, closed)
- `limit` - Number of results (default: 50)

#### GET /conversations/detail

Get conversation with messages.

**Query Parameters:**
- `conversation_id` - Conversation ID

---

### Analytics

#### GET /analytics/usage

Get API usage statistics.

**Query Parameters:**
- `shop_id` - Shop ID
- `days` - Number of days (default: 30)

#### GET /analytics/leads

Get lead scores for conversations.

**Query Parameters:**
- `shop_id` - Shop ID
- `limit` - Number of results (default: 50)

---

### Settings

#### GET /settings/get

Get shop settings.

**Query Parameters:**
- `shop_id` - Shop ID
- `key` - Specific setting key (optional)

#### POST /settings/update

Update shop settings.

**Request:**
```json
{
    "shop_id": 1,
    "settings": {
        "auto_reply": true,
        "welcome_message": "Hello!",
        "business_hours": {"monday": "9-18"}
    }
}
```

---

### Webhooks

#### GET /webhook

Meta webhook verification.

**Query Parameters:**
- `hub.mode` - Must be "subscribe"
- `hub.verify_token` - Verification token
- `hub.challenge` - Challenge string

#### POST /webhook

Receive messages from Meta Messenger.

---

### Health

#### GET /health

Health check endpoint (no auth required).

**Response:**
```json
{
    "status": "healthy",
    "php_version": "8.2.0",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
    "error": "Authentication required"
}
```

### 422 Validation Error
```json
{
    "error": "Validation failed",
    "errors": {
        "email": "Email is required",
        "password": "Password must be at least 6 characters"
    }
}
```

### 429 Rate Limited
```json
{
    "error": "Too many requests",
    "retry_after": 60
}
```

### 500 Server Error
```json
{
    "error": "Internal server error"
}
```
