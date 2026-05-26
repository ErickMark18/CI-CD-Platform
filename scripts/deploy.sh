#!/bin/bash
set -e

IMAGE_TAG="${1:-sha-$(git rev-parse --short HEAD)}"
REPO_OWNER="${REPO_OWNER:-$(git remote get-url origin | cut -d/ -f4 | sed 's/.*://')}"

PREVIOUS_IMAGE=$(docker inspect app --format '{{.Image}}' 2>/dev/null || echo "")

docker pull ghcr.io/${REPO_OWNER}/ci-cd-platform:${IMAGE_TAG}

docker stop app nginx-proxy 2>/dev/null || true
docker rm app nginx-proxy 2>/dev/null || true

IMAGE=${IMAGE_TAG} REPO_OWNER=${REPO_OWNER} docker-compose -f docker-compose.prod.yml up -d

if [ -n "${PREVIOUS_IMAGE}" ]; then
    echo "${PREVIOUS_IMAGE}" > /tmp/previous_image
fi
