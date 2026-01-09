#!/bin/bash
set -e

# Create required directories
mkdir -p /var/log/php /tmp/sessions
chown www-data:www-data /var/log/php /tmp/sessions

# Initialize legacy code if not exists
if [ ! -f /var/www/html/index.php ]; then
    echo "Copying legacy code to volume..."
    cp -r /app/legacy/* /var/www/html/ 2>/dev/null || true
    chown -R www-data:www-data /var/www/html
fi

# Install composer dependencies if composer.json exists
if [ -f /var/www/html/composer.json ]; then
    cd /var/www/html
    gosu www-data composer install --no-dev --optimize-autoloader 2>/dev/null || true
fi

# Install npm dependencies if package.json exists
if [ -f /var/www/html/package.json ]; then
    cd /var/www/html
    gosu www-data npm install --production 2>/dev/null || true
fi

# Execute the main command
exec "$@"
