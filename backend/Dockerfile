FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpng-dev libxml2-dev libzip-dev \
    libonig-dev libcurl4-openssl-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring xml zip bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --optimize-autoloader --no-dev --no-scripts --no-interaction

RUN mkdir -p storage/framework/{sessions,views,cache,testing} \
    storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

EXPOSE 8080

CMD ["sh", "-c", "php artisan migrate --force && php artisan passport:install --force && php artisan vendor:publish --provider='CloudinaryLabs\\CloudinaryLaravel\\CloudinaryServiceProvider' && php artisan config:cache && php artisan serve --host=0.0.0.0 --port=8080"]