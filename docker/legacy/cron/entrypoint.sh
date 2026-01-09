#!/bin/bash
set -e

echo "Starting cron service for game turn processing..."

# Wait for PHP-FPM to be ready
until curl -sf http://legacy-nginx/health > /dev/null 2>&1; do
    echo "Waiting for legacy-nginx to be ready..."
    sleep 5
done

echo "Legacy nginx is ready. Starting cron daemon..."

# Start cron in foreground
exec crond -f -L /dev/stdout
