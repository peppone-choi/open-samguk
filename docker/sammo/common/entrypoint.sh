#!/bin/bash
set -e

APP_DIR="/app"
GIT_REPO=${GIT_REPO:-"https://github.com/peppone-choi/open-samguk.git"}
GIT_BRANCH=${GIT_BRANCH:-"main"}

echo "=== Sammo TS Runtime Entrypoint ==="

# 1. Clone or Update Source
if [ ! -d "$APP_DIR/.git" ]; then
    echo "Directory $APP_DIR is empty. Cloning from $GIT_REPO ($GIT_BRANCH)..."
    git clone -b "$GIT_BRANCH" "$GIT_REPO" "$APP_DIR"
else
    echo "Source code already exists in $APP_DIR. Pulling latest..."
    cd "$APP_DIR"
    git pull origin "$GIT_BRANCH"
fi

cd "$APP_DIR"

# Ensure pnpm is available and updated
corepack enable
pnpm --version

# === CONCURRENCY LOCK ===
# Multiple service containers sharing the same volume might try to clone/install/build simultaneously.
# We use a simple lock file mechanism to ensure only one service performs the initialization.
LOCKFILE="/app/.init.lock"
INIT_DONE="/app/.init.done"

# If we are the setup service, we take the lead. Others wait.
if [ "$SERVICE_TYPE" = "setup" ]; then
    echo "[Setup] Initializing shared volume..."
    touch "$LOCKFILE"
else
    while [ -f "$LOCKFILE" ] && [ ! -f "$INIT_DONE" ]; do
        echo "[$SERVICE_TYPE] Waiting for initialization to complete..."
        sleep 5
    done
fi

# 2. Install Dependencies
# Check if node_modules exists AND has the expected structure
# The shared volume may have incomplete or stale dependencies
# IMPORTANT: pnpm workspaces create symlinks in each package's node_modules
# These symlinks MUST exist for ESM module resolution to work
INSTALL_REQUIRED=false
if [ ! -d "node_modules" ]; then
    echo "node_modules not found."
    INSTALL_REQUIRED=true
elif [ ! -d "node_modules/.pnpm" ]; then
    echo "node_modules/.pnpm not found - incomplete install detected."
    INSTALL_REQUIRED=true
elif [ "$FORCE_UPDATE" = "true" ]; then
    echo "Force update requested."
    INSTALL_REQUIRED=true
fi

# Check service-specific node_modules symlinks (critical for ESM resolution)
# pnpm creates symlinks from apps/*/node_modules -> root node_modules/.pnpm
case "$SERVICE_TYPE" in
    "api")
        if [ ! -d "apps/api/node_modules" ]; then
            echo "apps/api/node_modules symlink missing - install required."
            INSTALL_REQUIRED=true
        fi
        ;;
    "engine")
        if [ ! -d "apps/engine/node_modules" ]; then
            echo "apps/engine/node_modules symlink missing - install required."
            INSTALL_REQUIRED=true
        fi
        ;;
    "web")
        if [ ! -d "apps/web/node_modules" ]; then
            echo "apps/web/node_modules symlink missing - install required."
            INSTALL_REQUIRED=true
        fi
        ;;
esac

if [ "$INSTALL_REQUIRED" = "true" ]; then
    echo "Installing dependencies with pnpm (method: copy)..."
    # Use copy method to avoid broken hardlinks when sharing node_modules via volumes
    pnpm install --frozen-lockfile --package-import-method=copy
fi

# 3. Build
# Check if the specific service's build artifacts exist and are complete
BUILD_REQUIRED=false
case "$SERVICE_TYPE" in
    "api") [ ! -f "apps/api/dist/main.js" ] && BUILD_REQUIRED=true ;;
    "engine") [ ! -f "apps/engine/dist/main.js" ] && BUILD_REQUIRED=true ;;
    "web") [ ! -f "apps/web/.next/BUILD_ID" ] && BUILD_REQUIRED=true ;;
    "setup") [ ! -f "packages/infra/dist/index.js" ] && BUILD_REQUIRED=true ;;
    *) [ ! -d "packages/logic/dist" ] && BUILD_REQUIRED=true ;;
esac

if [ "$BUILD_REQUIRED" = "true" ] || [ "$FORCE_UPDATE" = "true" ]; then
    echo "Found incomplete build or update forced for $SERVICE_TYPE. Building packages and apps..."
    if [ "$SERVICE_TYPE" = "setup" ]; then
        # Setup should build everything to ensure shared volume is ready
        pnpm run build
    else
        # Other services might try to build only themselves if needed, but usually setup did it
        pnpm run build
    fi
fi

# Mark initialization as done if we are setup
if [ "$SERVICE_TYPE" = "setup" ]; then
    touch "$INIT_DONE"
    rm -f "$LOCKFILE"
    echo "[Setup] Initialization complete."
fi

# Setup Database URL if not provided but Postgres info is there
if [ -z "$DATABASE_URL" ] && [ -n "$POSTGRES_USER" ]; then
    export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
fi

# 4. Ensure Prisma Client
if [ -d "packages/infra/prisma" ]; then
    echo "Syncing Prisma Client..."
    pnpm --filter @sammo/infra db:generate
fi

# 5. Specific Service Execution
case "$SERVICE_TYPE" in
    "api")
        echo "Starting API Service..."
        exec pnpm --filter @sammo/api start:prod
        ;;
    "engine")
        echo "Starting Engine Service..."
        exec pnpm --filter @sammo/engine start
        ;;
    "web")
        echo "Starting Web Service..."
        exec pnpm --filter @sammo/web start
        ;;
    "setup")
        echo "Starting Initial Setup..."
        # Wait for DB
        until node -e "require('net').createConnection(5432, 'postgres').on('connect', () => process.exit(0)).on('error', () => process.exit(1))" 2>/dev/null; do
            echo "Waiting for Database..."
            sleep 2
        done
        echo "Running DB Push..."
        pnpm --filter @sammo/infra db:push
        echo "Setup Complete!"
        exit 0
        ;;
    *)
        echo "Unknown SERVICE_TYPE: $SERVICE_TYPE"
        exec "$@"
        ;;
esac
