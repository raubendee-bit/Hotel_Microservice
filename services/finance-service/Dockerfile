FROM php:8.2-fpm-alpine

# Install system dependencies & PHP extensions
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    unzip \
    curl \
    git \
    bash

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd zip bcmath

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install Composer dependencies
RUN mkdir -p /var/www/html/bootstrap/cache /var/www/html/storage/framework/{sessions,views,cache} \
    && composer install --no-dev --optimize-autoloader --no-interaction
RUN chmod +x /var/www/html/artisan

# Set directory permissions for Laravel
RUN chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Copy Nginx config for single microservice
COPY services/finance-service/docker/nginx.conf /etc/nginx/nginx.conf

# Script to start Nginx & PHP-FPM
COPY services/finance-service/docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
