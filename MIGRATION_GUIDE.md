# OrtamNasil? — Hetzner Tasima Rehberi

Tarih: 2026-09-17
Hedef: Mevcut Hetzner sunucusuna (motorya yanina) tasima

---

## 1. Mevcut vs Hedef Altyapi

| Bilesen | Simdiki | Hedef |
|---------|---------|-------|
| **App** | Vercel (serverless) | Hetzner Docker container (port 3003) |
| **DB** | AWS EC2 PostgreSQL 16 | Hetzner mevcut PostgreSQL (yeni DB) |
| **Proxy** | Vercel CDN | Mevcut nginx + Cloudflare |
| **SSL** | Vercel otomatik | Cloudflare Origin Certificate |
| **DNS** | Cloudflare → Vercel | Cloudflare → Hetzner IP (turuncu bulut ACIK) |
| **Cron** | vercel.json | Sistem crontab |

**DIKKAT:** Hetzner'da motorya calisiyor. Port 3000, 5432, 80/443 dolu.

---

## 2. Cakisma Onleme

| Kaynak | Motorya | OrtamNasil |
|--------|---------|------------|
| App port | 3000 | **3003** |
| DB | vites (mevcut PG) | ortamnasil (ayni PG, yeni DB) |
| Nginx | motorya.com.tr server blogu | ortamnasil.com server blogu eklenir |
| Docker | motorya containerlari | ayri ortamnasil containeri |

---

## 3. Adim Adim Tasima

### Adim 1 — Mevcut PostgreSQL'de yeni DB olustur

```sql
sudo -u postgres psql

CREATE USER ortamnasil_user WITH PASSWORD 'GUCLU_SIFRE';
CREATE DATABASE ortamnasil OWNER ortamnasil_user;

-- vites'e erisim YOK
REVOKE ALL ON DATABASE vites FROM ortamnasil_user;

\q
```

### Adim 2 — Repo'yu klonla

```bash
cd /opt  # veya tercih ettigin dizin
git clone https://github.com/gokhansk1989/ortamnasil.git
cd ortamnasil
```

### Adim 3 — .env olustur

```bash
cp web/.env.example web/.env
nano web/.env
```

Doldurulacak degerler:

```
DATABASE_URL="postgresql://ortamnasil_user:SIFRE@host.docker.internal:5432/ortamnasil"
AUTH_PEPPER="ortamnasil_pepper_2024_secret"   # DEGISTIRME
SESSION_SECRET="mevcut_deger"
RESEND_API_KEY="re_..."                       # resend.com'dan al
ADMIN_EMAIL="gokhansk1989@gmail.com"
CRON_SECRET="rastgele_guclu_string"
NEXT_PUBLIC_GA_ID="G-..."
NEXT_PUBLIC_META_PIXEL_ID="..."
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
GOOGLE_SITE_VERIFICATION="..."
```

> NOT: Docker container'dan host'taki PostgreSQL'e erisim icin
> `host.docker.internal` veya `172.17.0.1` kullan.
> Linux'ta docker-compose'a `extra_hosts: ["host.docker.internal:host-gateway"]` ekle.

### Adim 4 — Docker container'i baslat

```bash
docker compose up -d --build
```

Container port 3003'te calisacak, motorya'ya dokunmaz.

### Adim 5 — Tablolari olustur

```bash
docker compose exec app npx prisma db push
```

### Adim 6 — Verileri aktar

```bash
# migration_backup_20260917/ klasorunu sunucuya kopyala
scp -r migration_backup_20260917/ root@HETZNER_IP:/opt/ortamnasil/

# Restore scriptini calistir
cd /opt/ortamnasil/migration_backup_20260917
DATABASE_URL="postgresql://ortamnasil_user:SIFRE@localhost:5432/ortamnasil" ./restore_db.sh
```

### Adim 7 — Cloudflare Origin Certificate olustur

Cloudflare Dashboard → SSL/TLS → Origin Server → Create Certificate:
- Hostnames: `ortamnasil.com`, `*.ortamnasil.com`
- Validity: 15 years

```bash
sudo mkdir -p /etc/ssl/ortamnasil
sudo nano /etc/ssl/ortamnasil/origin.pem      # Certificate icerigi yapistir
sudo nano /etc/ssl/ortamnasil/origin-key.pem   # Private key yapistir
sudo chmod 600 /etc/ssl/ortamnasil/origin-key.pem
```

### Adim 8 — Nginx server blogu ekle

```bash
sudo cp /opt/ortamnasil/nginx-ortamnasil.conf /etc/nginx/sites-available/ortamnasil
sudo ln -s /etc/nginx/sites-available/ortamnasil /etc/nginx/sites-enabled/
sudo nginx -t          # HATA OLMAMALI
sudo systemctl reload nginx
```

### Adim 9 — Cloudflare DNS guncelle

Cloudflare Dashboard → DNS:

| Tip | Ad | Deger | Proxy |
|-----|-----|-------|-------|
| A | `@` | HETZNER_IP | Turuncu bulut ACIK |
| A | `www` | HETZNER_IP | Turuncu bulut ACIK |

SSL/TLS mode: **Full (Strict)** (Origin cert kullandigin icin)

### Adim 10 — Cron job ekle

```bash
crontab -e
# Ekle:
0 10 * * * curl -s -H "Authorization: Bearer CRON_SECRET_DEGERI" http://127.0.0.1:3003/api/cron/hatirlatma
```

### Adim 11 — Yedekleme genislet

Mevcut yedekleme scriptine ortamnasil DB'sini ekle:
```bash
pg_dump -U ortamnasil_user ortamnasil | gzip > /backup/ortamnasil_$(date +\%Y\%m\%d).sql.gz
```

### Adim 12 — Test et

```bash
# Container calisiyor mu?
docker ps | grep ortamnasil

# Lokal test
curl -I http://127.0.0.1:3003

# DNS yayildiktan sonra
curl -I https://www.ortamnasil.com
```

### Adim 13 — Temizlik

- Vercel projesini kapat veya sil
- AWS EC2 PostgreSQL'i kapat (DNS yayildiktan 48 saat sonra)

---

## 4. Ortam Degiskenleri

### KRITIK — Degismemesi gerekenler

| Degisken | Neden |
|----------|-------|
| `AUTH_PEPPER` | Degisirse tum kullanici girisleri bozulur (HMAC hash eslesemez) |
| `SESSION_SECRET` | Degisirse aktif oturumlar duser (kabul edilebilir) |
| VAPID key cifti | Degisirse mevcut push abonelikleri calismaz |

### Tam liste

Bkz. `web/.env.example`

---

## 5. Onemli Uyarilar

1. **Motorya'ya dokunma** — Ayri DB, ayri port, ayri container
2. **AUTH_PEPPER asla degismemeli** — `ortamnasil_pepper_2024_secret`
3. **Turuncu bulut ACIK olmali** — Kapatirsan Hetzner'a direkt erisim olmaz (firewall 80/443 sadece CF IP'lerine acik)
4. **DNS propagation** — 24-48 saat surebilir, bu surede Vercel da calisir durumda olsun
5. **ads.txt** — Yeni sunucudan da sunulmali (public/ klasorunde)
6. **Resend domain** — Gonderen domain ayarini kontrol et
7. **Docker extra_hosts** — Linux'ta host DB'ye erismek icin gerekli
