#!/bin/sh

# Ensure storage and bootstrap directories are present and writable
mkdir -p /var/www/html/bootstrap/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/logs
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Run migrations (we set force because it's running in production mode)
php artisan migrate --force || true

# Start php-fpm in background
php-fpm -D

# Start Nginx in foreground
nginx
