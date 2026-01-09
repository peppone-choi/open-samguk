# Parity Bridge Service
# Node.js service to invoke legacy PHP and capture snapshots

FROM node:20-slim

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY docker/parity-bridge/package.json ./
COPY docker/parity-bridge/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source
COPY docker/parity-bridge/src ./src

# Build TypeScript
RUN npm run build

# Create snapshots directory
RUN mkdir -p /app/snapshots

# Expose port
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:3100/health || exit 1

# Run the bridge
CMD ["node", "dist/index.js"]
