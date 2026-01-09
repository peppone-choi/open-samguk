#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until node -e "require('net').createConnection(5432, 'postgres').on('connect', () => process.exit(0)).on('error', () => process.exit(1))" 2>/dev/null; do
  sleep 1
done

echo "Starting the application..."
exec pnpm --filter @sammo/api start:prod
