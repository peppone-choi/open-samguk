#!/bin/bash

# Sammo TypeScript Build & Tag Script

REGISTRY="ghcr.io/peppone-choi/open-samguk"
TAG="latest"

echo "Building Sammo TypeScript images..."

# Build unified Dockerfile stages
docker build --target api -t ${REGISTRY}/api:${TAG} -f docker/sammo/Dockerfile .
docker build --target engine -t ${REGISTRY}/engine:${TAG} -f docker/sammo/Dockerfile .
docker build --target web -t ${REGISTRY}/web:${TAG} -f docker/sammo/Dockerfile .
docker build --target setup -t ${REGISTRY}/setup:${TAG} -f docker/sammo/Dockerfile .
docker build -t ${REGISTRY}/nginx:${TAG} -f docker/sammo/nginx/Dockerfile .
docker build -t ${REGISTRY}/backup:${TAG} -f docker/sammo/backup/Dockerfile .

echo "Build complete. To push to registry, run:"
echo "docker push ${REGISTRY}/api:${TAG}"
echo "docker push ${REGISTRY}/engine:${TAG}"
echo "docker push ${REGISTRY}/web:${TAG}"
echo "docker push ${REGISTRY}/setup:${TAG}"
echo "docker push ${REGISTRY}/nginx:${TAG}"
echo "docker push ${REGISTRY}/backup:${TAG}"
