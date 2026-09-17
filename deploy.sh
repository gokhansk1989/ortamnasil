#!/bin/bash
# OrtamNasıl? — Hetzner Deploy Script
# Port: 3003 (motorya 3000'de, çakışma yok)
# DB: mevcut PostgreSQL'deki ortamnasil database'i (ayrı container yok)
# Proxy: mevcut nginx'e server bloğu eklendi
set -euo pipefail

echo "=== OrtamNasıl? Deploy ==="

echo "1. Pulling latest code..."
git pull origin main

echo "2. Building and restarting app container..."
docker compose up -d --build

echo "3. Running database migrations..."
docker compose exec app npx prisma db push --accept-data-loss=false

echo ""
echo "=== Deploy complete ==="
echo "App: http://127.0.0.1:3003 (nginx üzerinden https://www.ortamnasil.com)"
