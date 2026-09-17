# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
# Prisma sorgu motoru OpenSSL'e baglidir. Alpine 3.19+ openssl3 ile geliyor ve
# paket yoksa Prisma yanlis motoru (libssl 1.1) secip
# "Error loading shared library libssl.so.1.1" ile kiriliyor.
RUN apk add --no-cache openssl libc6-compat

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next, derleme sirasinda bazi modulleri degerlendirdigi icin env'e ihtiyac
# duyuyor (orn. AUTH_PEPPER). Vercel bunu kendisi enjekte ediyordu; burada
# .env .dockerignore ile dislandigi icin derleme "AUTH_PEPPER is required"
# diyerek kiriliyordu.
# Secret mount kullaniyoruz: deger derleme sirasinda gorunur ama imaj
# katmanlarinda iz birakmaz (build-arg olsaydi imaj gecmisinde kalirdi).
RUN --mount=type=secret,id=env,target=/app/.env,required=true npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
