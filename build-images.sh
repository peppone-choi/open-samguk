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

echo "Build complete. To push to registry, run: docker push ${REGISTRY}/xxx"
