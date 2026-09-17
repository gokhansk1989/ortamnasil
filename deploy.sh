#!/bin/bash
# OrtamNasıl? — Hetzner Deploy Script
# Kullanım: ./deploy.sh
set -euo pipefail

echo "=== OrtamNasıl? Deploy ==="

# Git pull
echo "1. Pulling latest code..."
git pull origin main

# Docker build & restart
echo "2. Building and restarting..."
docker compose up -d --build

# Prisma migrate (if needed)
echo "3. Running database migrations..."
docker compose exec app npx prisma db push --accept-data-loss=false

echo ""
echo "=== Deploy complete ==="
echo "Site: https://www.ortamnasil.com"
