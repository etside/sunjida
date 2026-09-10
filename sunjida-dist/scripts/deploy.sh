#!/bin/bash
# Deployment script

set -e

echo "=== Sunjida Deployment Script ==="

# Configuration
DEPLOY_DIR="/var/www/sunjida"
BACKUP_DIR="/var/backups/sunjida"
LOG_FILE="/var/log/sunjida-deploy.log"

# Functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    log "ERROR: $1"
    exit 1
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    error "Please run as root or with sudo"
fi

# Parse arguments
ACTION=${1:-deploy}

case $ACTION in
    deploy)
        log "Starting deployment..."

        # Create backup
        if [ -d "$DEPLOY_DIR" ]; then
            log "Creating backup..."
            BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
            mkdir -p "$BACKUP_DIR"
            tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$(dirname $DEPLOY_DIR)" "$(basename $DEPLOY_DIR)"
            log "Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
        fi

        # Install/Update dependencies
        log "Installing composer dependencies..."
        composer install --no-dev --optimize-autoloader --no-interaction

        # Run migrations
        log "Running database migrations..."
        for migration in migrations/*.sql; do
            if [ -f "$migration" ]; then
                log "Running: $migration"
                psql -U sunjida -d sunjida -f "$migration" || log "Warning: Migration may have already been applied"
            fi
        done

        # Set permissions
        log "Setting file permissions..."
        chown -R www-data:www-data "$DEPLOY_DIR"
        find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
        find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
        chmod -R 775 "$DEPLOY_DIR/logs" "$DEPLOY_DIR/cache" "$DEPLOY_DIR/tmp" 2>/dev/null || true

        # Clear cache
        log "Clearing application cache..."
        rm -rf "$DEPLOY_DIR/cache/"* 2>/dev/null || true

        # Restart services
        log "Restarting PHP-FPM..."
        systemctl restart php8.2-fpm || systemctl restart php-fpm || log "Warning: Could not restart PHP-FPM"

        log "Restarting Nginx..."
        systemctl restart nginx || log "Warning: Could not restart Nginx"

        log "Deployment completed successfully!"
        ;;

    rollback)
        log "Starting rollback..."

        # List available backups
        if [ ! -d "$BACKUP_DIR" ]; then
            error "No backups found"
        fi

        echo "Available backups:"
        ls -la "$BACKUP_DIR"

        read -p "Enter backup filename to restore: " BACKUP_FILE

        if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
            error "Backup file not found"
        fi

        log "Restoring from: $BACKUP_FILE"

        # Stop services
        systemctl stop php8.2-fpm || systemctl stop php-fpm || true

        # Restore
        rm -rf "$DEPLOY_DIR"
        tar -xzf "$BACKUP_DIR/$BACKUP_FILE" -C "$(dirname $DEPLOY_DIR)"

        # Set permissions
        chown -R www-data:www-data "$DEPLOY_DIR"

        # Start services
        systemctl start php8.2-fpm || systemctl start php-fpm || true
        systemctl restart nginx || true

        log "Rollback completed!"
        ;;

    status)
        echo "=== Deployment Status ==="
        echo ""
        echo "Deploy directory: $DEPLOY_DIR"
        if [ -d "$DEPLOY_DIR" ]; then
            echo "Status: DEPLOYED"
            echo "Last modified: $(stat -c %y $DEPLOY_DIR 2>/dev/null || echo 'Unknown')"
        else
            echo "Status: NOT DEPLOYED"
        fi
        echo ""
        echo "Available backups:"
        ls -la "$BACKUP_DIR" 2>/dev/null || echo "No backups"
        ;;

    *)
        echo "Usage: $0 {deploy|rollback|status}"
        exit 1
        ;;
esac
