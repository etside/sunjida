#!/bin/bash
# Development startup script

set -e

echo "=== Starting Sunjida Development Server ==="

# Check PHP version
PHP_VERSION=$(php -r 'echo PHP_VERSION;')
echo "PHP Version: $PHP_VERSION"

# Check required extensions
echo "Checking PHP extensions..."
php -m | grep -q "pdo_pgsql" || { echo "Error: pdo_pgsql extension missing"; exit 1; }
php -m | grep -q "curl" || { echo "Error: curl extension missing"; exit 1; }
php -m | grep -q "json" || { echo "Error: json extension missing"; exit 1; }
php -m | grep -q "mbstring" || { echo "Error: mbstring extension missing"; exit 1; }

echo "All required extensions present."

# Check .env file
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please edit .env with your configuration"
fi

# Create required directories
echo "Creating directories..."
mkdir -p logs cache tmp

# Set permissions
chmod -R 775 logs cache tmp

# Start PHP built-in server
echo ""
echo "Starting PHP development server on http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""

php -S localhost:8080 -t public public/index.php
