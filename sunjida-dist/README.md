# Sunjida - AI-Powered Sales Assistant

A production-ready PHP backend for salesdaddy.torquesticker.com, providing AI-powered customer service and sales assistance for e-commerce businesses.

## Features

- **AI Chat Assistant** - Real-time customer support via Messenger integration
- **Product Search** - Semantic search using vector embeddings (pgvector)
- **Lead Scoring** - Automatic lead qualification based on conversation signals
- **Inventory Management** - Product sync and stock tracking
- **Meta Integration** - Facebook Messenger webhook handling
- **Admin Dashboard** - Management interface for shops and settings
- **Embeddable Widget** - Chat widget for external websites

## Requirements

- PHP 8.1 or higher
- PostgreSQL 14+ with pgvector extension
- Composer
- Nginx or Apache with mod_rewrite

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sunjida-dist
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Set up database:
```bash
createdb sunjida
psql -U sunjida -d sunjida -f migrations/001_create_tables.sql
psql -U sunjida -d sunjida -f migrations/002_add_embeddings.sql
psql -U sunjida -d sunjida -f migrations/003_add_indexes.sql
psql -U sunjida -d sunjida -f seeds/seed.sql
```

5. Start development server:
```bash
./scripts/start-dev.sh
```

## Project Structure

```
sunjida-dist/
├── public/          # Web root (DocumentRoot)
├── src/            # PHP source (PSR-4 autoloaded)
├── cron/           # Scheduled tasks
├── migrations/     # Database migrations
├── seeds/          # Database seeds
├── tests/          # PHPUnit tests
├── docs/           # Documentation
├── scripts/        # Deployment scripts
├── logs/           # Application logs
└── cache/          # File-based cache
```

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture overview.

## Development

### Running Tests

```bash
# Run all tests
composer test

# Run unit tests only
composer test:unit

# Run integration tests
composer test:integration
```

### Code Style

```bash
# Check code style
composer check

# Auto-fix issues
composer check:fix
```

## License

Proprietary - All rights reserved.
