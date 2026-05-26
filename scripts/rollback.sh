#!/bin/bash
set -e

VERSION="${1:-}"

if [ -z "$VERSION" ]; then
    echo "Usage: ./rollback.sh <version|sha-xxxx>"
    exit 1
fi

REPO_OWNER="${REPO_OWNER:-$(git remote get-url origin | cut -d/ -f4 | sed 's/.*://')}"
IMAGE="ghcr.io/${REPO_OWNER}/ci-cd-platform:${VERSION}"

docker pull $IMAGE

docker stop app nginx-proxy 2>/dev/null || true
docker rm app nginx-proxy 2>/dev/null || true

IMAGE=${VERSION} REPO_OWNER=${REPO_OWNER} docker-compose -f docker-compose.prod.yml up -d

echo "Rolled back to $IMAGE"
