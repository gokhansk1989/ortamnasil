#!/bin/bash
# OrtamNasıl? — Sunucu Login Fix Scripti
# Kullanım: Hetzner sunucusunda /opt/ortamnasil dizininde çalıştır
set -euo pipefail

echo "=== OrtamNasıl? Login Fix ==="
echo ""

ENV_FILE="web/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "HATA: $ENV_FILE bulunamadı. Doğru dizinde misin?"
  exit 1
fi

# 1. AUTH_PEPPER kontrolü
CURRENT_PEPPER=$(grep -E '^AUTH_PEPPER=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
CORRECT_PEPPER="ortamnasil_pepper_2024_secret"

echo "1. AUTH_PEPPER kontrolü..."
if [ "$CURRENT_PEPPER" = "$CORRECT_PEPPER" ]; then
  echo "   ✓ AUTH_PEPPER doğru"
else
  echo "   ✗ AUTH_PEPPER YANLIŞ!"
  echo "   Mevcut: '$CURRENT_PEPPER'"
  echo "   Olması gereken: '$CORRECT_PEPPER'"
  echo ""
  echo "   Düzeltiliyor..."
  if grep -q '^AUTH_PEPPER=' "$ENV_FILE"; then
    sed -i "s|^AUTH_PEPPER=.*|AUTH_PEPPER=$CORRECT_PEPPER|" "$ENV_FILE"
  else
    echo "AUTH_PEPPER=$CORRECT_PEPPER" >> "$ENV_FILE"
  fi
  echo "   ✓ AUTH_PEPPER düzeltildi"
  PEPPER_FIXED=true
fi

# 2. Test kullanıcı temizliği (test sırasında oluştu)
echo ""
echo "2. Test kullanıcı temizliği..."
DB_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DB_URL" ]; then
  echo "   HATA: DATABASE_URL bulunamadı"
else
  # Container dışından doğrudan DB'ye bağlan
  # host.docker.internal yerine localhost kullan
  LOCAL_DB_URL=$(echo "$DB_URL" | sed 's|host.docker.internal|localhost|g')

  DELETED=$(psql "$LOCAL_DB_URL" -t -c "
    DELETE FROM \"EmailVerification\" WHERE \"userId\" = 'cmu73s9dj0001yxtnd1nw9fag';
    DELETE FROM \"AuthCredential\" WHERE \"userId\" = 'cmu73s9dj0001yxtnd1nw9fag';
    DELETE FROM \"User\" WHERE \"id\" = 'cmu73s9dj0001yxtnd1nw9fag';
    SELECT 'OK';
  " 2>&1) || true

  if echo "$DELETED" | grep -q "OK"; then
    echo "   ✓ Test kullanıcı (TestKullanici99) silindi"
  else
    echo "   ⚠ Test kullanıcı silinemedi (belki zaten yok): $DELETED"
  fi
fi

# 3. Container yeniden başlat (AUTH_PEPPER değiştiyse)
if [ "${PEPPER_FIXED:-}" = "true" ]; then
  echo ""
  echo "3. Container yeniden başlatılıyor..."
  docker compose up -d --build
  echo "   ✓ Container yeniden başlatıldı"
fi

# 4. RESEND_API_KEY kontrolü
echo ""
echo "4. RESEND_API_KEY kontrolü..."
RESEND_KEY=$(grep -E '^RESEND_API_KEY=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
if [ -z "$RESEND_KEY" ] || [ "$RESEND_KEY" = "re_..." ]; then
  echo "   ✗ RESEND_API_KEY ayarlanmamış! E-posta gönderimi çalışmaz."
  echo "   → resend.com'dan API key al ve web/.env'ye ekle"
else
  echo "   ✓ RESEND_API_KEY ayarlanmış ($( echo "$RESEND_KEY" | head -c 6 )...)"
fi

echo ""
echo "=== Tamamlandı ==="
echo "Login testi: curl -s -X POST http://127.0.0.1:3003/api/auth/giris -H 'Content-Type: application/json' -d '{\"email\":\"gokhansk1989@gmail.com\",\"password\":\"SIFREN\"}'"
