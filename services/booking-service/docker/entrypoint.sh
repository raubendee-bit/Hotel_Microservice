#!/bin/sh
set -e

# Ensure storage and bootstrap directories are present and writable
mkdir -p /var/www/html/bootstrap/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/logs
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Run migrations (force because this container may run in non-interactive mode)
php artisan migrate --force || true

# Start php-fpm in background
php-fpm -D

# Start Nginx in foreground
nginx
