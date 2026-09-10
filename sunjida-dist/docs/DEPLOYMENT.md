# Deployment Guide

## Prerequisites

- PHP 8.1+ with extensions: pdo_pgsql, curl, json, mbstring, openssl
- PostgreSQL 14+ with pgvector extension
- Composer
- Nginx or Apache with mod_rewrite
- Node.js 18+ (for building frontend assets)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-repo/sunjida.git
cd sunjida
```

2. Install PHP dependencies:
```bash
composer install --no-dev --optimize-autoloader
```

3. Copy and configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Generate JWT secret:
```bash
openssl rand -hex 32
```

## Database Setup

1. Create database:
```bash
createdb sunjida
```

2. Run migrations:
```bash
psql -U sunjida -d sunjida -f migrations/001_create_tables.sql
psql -U sunjida -d sunjida -f migrations/002_add_embeddings.sql
psql -U sunjida -d sunjida -f migrations/003_add_indexes.sql
```

3. Seed initial data:
```bash
psql -U sunjida -d sunjida -f seeds/seed.sql
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name salesdaddy.torquesticker.com;
    root /var/www/sunjida/public;
    index index.php;

    # Handle SPA routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Handle API routes
    location /api {
        try_files $uri $uri/ =404;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ ^/(src|config|logs|vendor)/ {
        deny all;
    }
}
```

## Cron Jobs

Add to crontab:

```bash
# Process queue every minute
* * * * * /usr/bin/php /var/www/sunjida/cron/process_queue.php >> /var/www/sunjida/logs/cron.log 2>&1

# Sync inventory every 5 minutes
*/5 * * * * /usr/bin/php /var/www/sunjida/cron/sync_inventory.php >> /var/www/sunjida/logs/cron.log 2>&1

# Cleanup logs daily at 2 AM
0 2 * * * /usr/bin/php /var/www/sunjida/cron/cleanup_logs.php >> /var/www/sunjida/logs/cron.log 2>&1
```

## File Permissions

```bash
# Set ownership
chown -R www-data:www-data /var/www/sunjida

# Set permissions
find /var/www/sunjida -type d -exec chmod 755 {} \;
find /var/www/sunjida -type f -exec chmod 644 {} \;

# Make writable directories
chmod -R 775 /var/www/sunjida/logs
chmod -R 775 /var/www/sunjida/cache
chmod -R 775 /var/www/sunjida/tmp
```

## SSL/TLS

Use Certbot for free SSL:

```bash
certbot --nginx -d salesdaddy.torquesticker.com
```

## Production Checklist

- [ ] Set `APP_ENV=production` in .env
- [ ] Disable debug mode: `APP_DEBUG=false`
- [ ] Set secure JWT secret
- [ ] Configure Meta App credentials
- [ ] Set up OpenAI API key
- [ ] Configure Lovable backend URL
- [ ] Enable PostgreSQL SSL connections
- [ ] Set up log rotation
- [ ] Configure backup schedule
- [ ] Test cron jobs
- [ ] Verify API endpoints

## Monitoring

### Health Check

```bash
curl https://salesdaddy.torquesticker.com/api/health
```

### Logs

Application logs are stored in:
- `logs/YYYY-MM-DD.log` - Daily application logs
- `logs/cron.log` - Cron job output

### Database Monitoring

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT 
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check PHP error logs
   - Verify .env configuration
   - Ensure database connection works

2. **Queue Jobs Not Processing**
   - Verify cron job is running
   - Check `logs/cron.log` for errors
   - Ensure queue table exists

3. **Embedding Search Not Working**
   - Verify pgvector extension is installed
   - Check OpenAI API key is valid
   - Ensure embeddings column exists

4. **Meta Webhook Not Receiving**
   - Verify webhook URL is correct
   - Check verify token matches
   - Ensure HTTPS is enabled
