# Architecture Overview

## System Architecture

```
                    +-----------------+
                    |   Cloudflare    |
                    |      CDN        |
                    +--------+--------+
                             |
                    +--------v--------+
                    |      Nginx      |
                    |   (Web Server)  |
                    +--------+--------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+     +-------------v-----------+
    |    PHP-FPM        |     |   Static Assets         |
    | (API + Backend)   |     |   (React SPA + Widget)  |
    +---------+---------+     +-------------------------+
              |
    +---------v---------+
    |    Application    |
    |      Layer        |
    +---------+---------+
              |
    +---------v---------+     +-------------------------+
    |    PostgreSQL      |     |    External APIs        |
    |    + pgvector      |     |  - Meta Graph API       |
    +--------------------+     |  - OpenAI               |
                               |  - Lovable Backend      |
                               +-------------------------+
```

## Directory Structure

```
sunjida-dist/
├── public/                 # Web root (DocumentRoot)
│   ├── index.php          # Main entry point / router
│   ├── api/               # API endpoints
│   │   ├── v1/           # Versioned API
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   ├── shops/    # Shop management
│   │   │   ├── products/ # Product operations
│   │   │   └── ...
│   │   └── health.php    # Health check
│   ├── admin/            # Admin dashboard
│   ├── widget/           # Chat widget embed
│   └── assets/           # Compiled React assets (SPA)
│
├── src/                   # Application source (PSR-4)
│   ├── Config/           # Configuration classes
│   ├── Controllers/      # Request handlers
│   ├── Models/           # Database models
│   ├── Services/         # Business logic
│   ├── Middleware/        # HTTP middleware
│   └── Utils/            # Utility classes
│
├── cron/                  # Scheduled tasks
├── migrations/            # Database migrations
├── seeds/                 # Database seeds
├── tests/                 # PHPUnit tests
├── docs/                  # Documentation
├── scripts/               # Deployment scripts
├── logs/                  # Application logs
├── cache/                 # File-based cache
└── vendor/                # Composer dependencies
```

## Request Flow

1. **Request arrives** at Nginx
2. **Routing** - Nginx forwards to appropriate handler:
   - `/api/*` → PHP-FPM via index.php router
   - `/admin/*` → Admin PHP router
   - Static files → Direct serving
3. **Middleware** - CORS, rate limiting applied
4. **Controller** - Route handler invoked
5. **Service** - Business logic executed
6. **Model** - Database queries via PDO
7. **Response** - JSON/HTML returned

## Key Components

### Models

- **User** - User accounts and authentication
- **Shop** - Merchant shops with Meta integration
- **Product** - Product catalog with embeddings
- **Inventory** - Stock management
- **Conversation** - Chat sessions
- **Message** - Individual messages
- **Queue** - Async job processing

### Services

- **AuthController** - JWT authentication
- **MetaService** - Facebook Graph API integration
- **LovableService** - AI chat backend proxy
- **EmbeddingService** - OpenAI embeddings
- **VectorSearchService** - Semantic search via pgvector
- **InventorySyncService** - Product synchronization
- **QueueService** - Job queue management
- **LeadScoringService** - Conversation lead scoring

### Middleware

- **AuthMiddleware** - JWT verification
- **RateLimitMiddleware** - API rate limiting
- **CorsMiddleware** - Cross-origin resource sharing

## Data Flow

### Chat Flow

```
User Widget → /api/v1/chat → WidgetController → LovableService → Lovable API
                                              ↓
                                         Response → User
```

### Product Search Flow

```
User Query → /api/v1/products/search → AdminController
                                         ↓
                               EmbeddingService → OpenAI API
                                         ↓
                               VectorSearchService → pgvector query
                                         ↓
                               Results → User
```

### Meta Webhook Flow

```
Meta Messenger → /api/v1/webhook → WebhookController
                                      ↓
                            MetaService → Verify signature
                                      ↓
                            ConversationService → Process message
                                      ↓
                            QueueService → Async response
```

## Database Schema

### Core Tables

- **users** - User accounts
- **shops** - Merchant shops
- **products** - Product catalog
- **inventory** - Stock levels
- **conversations** - Chat sessions
- **messages** - Chat messages
- **queue** - Job queue
- **settings** - Shop configurations
- **api_usage** - Usage tracking
- **audit_log** - Activity log

### Vector Search

Products table includes `embedding` column (vector(1536)) for semantic search using pgvector extension with HNSW indexing.

## Security

- JWT authentication with 24-hour expiry
- Rate limiting per IP (configurable)
- CORS whitelist for allowed origins
- Input validation on all endpoints
- SQL injection prevention via PDO prepared statements
- XSS prevention via output escaping
- CSRF protection for admin forms

## Performance

- **pgvector HNSW index** for fast approximate nearest neighbor search
- **GIN indexes** for full-text search
- **Trigram indexes** for fuzzy matching
- **FOR UPDATE SKIP LOCKED** for queue processing
- **File-based caching** for rate limits
- **Connection pooling** via PHP-FPM

## Scalability Considerations

- Horizontal scaling via load balancer
- Read replicas for PostgreSQL
- Redis/Memcached for session/cache (future)
- Queue workers can be scaled independently
- Static assets served via CDN
