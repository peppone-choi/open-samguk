#!/bin/sh
set -e

echo "Starting System Setup..."

# Wait for DB
until node -e "require('net').createConnection(5432, 'postgres').on('connect', () => process.exit(0)).on('error', () => process.exit(1))" 2>/dev/null; do
  echo "Waiting for Database..."
  sleep 2
done

echo "Database is ready. Synchronizing Schema..."
pnpm --filter @sammo/infra db:push

echo "Setup Complete!"
