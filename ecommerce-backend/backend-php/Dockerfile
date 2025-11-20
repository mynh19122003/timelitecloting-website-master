# PHP Backend Dockerfile
FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application code first (except vendor will be created by composer)
COPY . .

# Install dependencies after copying code
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create non-root user
RUN addgroup -g 1001 -S www
RUN adduser -S www -u 1001

# Change ownership
RUN chown -R www:www /var/www/html

# Copy custom php-fpm config
COPY www.conf /usr/local/etc/php-fpm.d/www.conf

USER www

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD php -r "echo 'OK';" || exit 1

# Start PHP-FPM
CMD ["php-fpm"]
