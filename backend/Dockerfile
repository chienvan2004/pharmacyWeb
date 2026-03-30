FROM dunglas/frankenphp:php8.2-bookworm

# Cài các extension PHP cần thiết
RUN install-php-extensions \
    pdo_mysql \
    mbstring \
    xml \
    curl \
    zip \
    bcmath \
    gd \
    opcache \
    intl \
    ctype \
    fileinfo \
    tokenizer

# Cài Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set thư mục làm việc
WORKDIR /app

# Copy toàn bộ code
COPY . .

# Cài dependencies
RUN composer install --optimize-autoloader --no-dev --no-scripts --no-interaction

# Tạo các thư mục cần thiết
RUN mkdir -p storage/framework/{sessions,views,cache,testing} \
    storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Tạo start script
RUN printf '#!/bin/sh\nphp artisan migrate --force\nphp artisan config:cache\nphp artisan serve --host=0.0.0.0 --port=${PORT:-8000}\n' > /app/start.sh \
    && chmod +x /app/start.sh

EXPOSE 8000

CMD ["/bin/sh", "/app/start.sh"]