# PHP-FPM for Legacy Application
# Based on: https://storage.hided.net/gitea/devsam/docker/hidche/app

FROM php:8.3-fpm-bookworm

ENV LC_ALL=C.UTF-8

# Install system dependencies
RUN apt-get update && apt-get install -y \
    bzip2 zip unzip p7zip-full git rsync \
    libmemcached-dev libcurl4-openssl-dev \
    libicu-dev libjpeg-dev libpng-dev libwebp-dev libavif-dev libfreetype6-dev \
    libzip-dev libxml2-dev libsqlite3-dev gosu build-essential \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions
RUN debMultiarch="$(dpkg-architecture --query DEB_BUILD_MULTIARCH)"; \
    docker-php-ext-configure gd --with-freetype --with-webp --with-avif --with-jpeg; \
    docker-php-ext-configure pdo_mysql --with-pdo-mysql=mysqlnd; \
    docker-php-ext-configure mysqli --with-mysqli=mysqlnd; \
    docker-php-ext-install -j "$(nproc)" \
        exif \
        gd \
        intl \
        opcache \
        sysvmsg \
        sysvsem \
        sysvshm \
        pcntl \
        pdo_mysql \
        mysqli \
        zip

# Install PECL extensions
RUN pecl install ds && docker-php-ext-enable ds

# Install Node.js LTS
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -yq nodejs && \
    npm install -g npm

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create directories
RUN mkdir -p /var/www/html /var/www/.ssh /var/www/opcache

# Copy configuration
COPY docker/legacy/php-fpm/sam_conf.ini /usr/local/etc/php/conf.d/sam_conf.ini
COPY docker/legacy/php-fpm/entrypoint.sh /usr/local/bin/entrypoint.sh

# Adjust UID/GID
ARG UID=33
ARG GID=33

RUN if [ "$UID" != "33" ]; then \
      usermod -u $UID -o www-data; \
    fi; \
    if [ "$GID" != "33" ]; then \
      groupmod -g $GID -o www-data; \
    fi; \
    chmod +x /usr/local/bin/entrypoint.sh; \
    chown -R www-data:www-data /var/www; \
    chmod -R g=u /var/www

# PHP-FPM pool configuration
RUN echo 'pm.max_children = 15' >> /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo 'pm.max_requests = 500' >> /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo 'request_terminate_timeout = 600' >> /usr/local/etc/php-fpm.d/zz-docker.conf

VOLUME /var/www/html

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
