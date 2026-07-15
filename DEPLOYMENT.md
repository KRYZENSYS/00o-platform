# 00o.uz — Deployment Guide

## 🇺🇿 O'zbek tilidagi to'liq deploy qo'llanma

### 1. Tayyorgarlik

**Kerakli servislar:**
- ✅ Domen (masalan: 00o.uz)
- ✅ Server (4GB RAM, 2 vCPU kamida)
- ✅ Cloudflare account
- ✅ Telegram bot tokeni
- ✅ Email/SMS provider
- ✅ Payment provider (Payme/Click)

### 2. Server sozlash

```bash
# Ubuntu 22.04
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl

# Firewall
sudo ufw allow 22,80,443
sudo ufw enable

# Docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 3. SSL sertifikat

```bash
sudo certbot --nginx -d 00o.uz -d www.00o.uz
```

### 4. Reponi clone qilish

```bash
sudo mkdir -p /app && cd /app
sudo git clone https://github.com/KRYZENSYS/00o-platform.git .
sudo chown -R $USER:$USER /app
```

### 5. Environment sozlash

```bash
cp .env.example .env
nano .env  # Barcha qiymatlarni kiriting
```

### 6. Ishga tushirish

```bash
docker-compose up -d
docker-compose logs -f
```

### 7. Database migratsiya

```bash
docker-compose exec api pnpm --filter @00o/database prisma migrate deploy
docker-compose exec api pnpm --filter @00o/database prisma db seed
```

### 8. Tekshirish

```bash
curl https://00o.uz
curl https://00o.uz/api/v1/health
```

## 🚀 Vercel (Web only)

```bash
# Web ilovani Vercel'ga deploy
cd apps/web
vercel --prod
```

Environment variables:
- `NEXT_PUBLIC_API_URL` = https://api.00o.uz/api/v1
- `NEXT_PUBLIC_WS_URL` = wss://api.00o.uz/api/v1

## 🤖 Railway (API + Bot)

```bash
# Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

## 🗄 Database

### Option 1: Supabase (Bepul, tavsiya)
1. https://supabase.com da akkaunt yarating
2. Yangi project yarating
3. Database URL ni `.env` ga qo'ying
4. Connection pooling yoqilgan bo'lishi kerak

### Option 2: Neon
1. https://neon.tech da akkaunt
2. Yangi database yarating
3. Free tier 0.5GB

### Option 3: Railway
Built-in PostgreSQL

## 🔴 Redis

### Upstash (Bepul, 10k so'rov/kun)
1. https://upstash.com
2. Yangi Redis yarating
3. REST URL + Token `.env` ga

## 📦 Storage

### Cloudflare R2 (Bepul 10GB)
1. Cloudflare dashboard → R2
2. Bucket yarating
3. API token yarating
4. R2_PUBLIC_URL ni o'rnating

## 💳 Payments

### Payme
1. https://paycom.uz da ro'yxatdan o'ting
2. Merchant ID va Secret key oling
3. Test rejimida sinab ko'ring
4. Production'ga o'tkazing

### Click
1. https://click.uz da ro'yxatdan o'ting
2. Service code oling
3. `.env` ga qo'ying

### Uzum
1. https://uzum.uz da ro'yxatdan o'ting
2. API key oling

## 📧 Email (Resend)

1. https://resend.com
2. Domenni ulang
3. API key oling

## 📱 SMS (Eskiz.uz)

1. https://eskiz.uz
2. Akkaunt yarating
3. Email/password bilan API token oling

## 🤖 Telegram Bot

1. @BotFather ga yozing
2. `/newbot` — yangi bot
3. Token oling
4. `.env` ga `BOT_TOKEN` qo'ying
5. WebApp URL: `/setdomain` → 00o.uz
6. `/setmenubutton` → WebApp URL

## 📊 Monitoring

### Sentry (Error tracking)
```bash
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### PostHog (Analytics)
```bash
POSTHOG_KEY=phc_xxx
```

## 🔒 Xavfsizlik

- ✅ HTTPS majburiy
- ✅ Firewall (UFW)
- ✅ SSH key-based auth
- ✅ Rate limiting
- ✅ Regular backups
- ✅ Sentry monitoring
- ✅ Auto-updates

## 💰 Narxlar (oyiga)

| Servis | Narx |
|--------|------|
| Server (4GB) | $24 |
| Domen | $1 |
| Supabase | Bepul |
| Upstash Redis | Bepul |
| Cloudflare R2 | Bepul (10GB) |
| Resend | Bepul (3k email) |
| Eskiz.uz | ~50,000 so'm |
| **Jami** | **~$25/oy** |

## 📈 Scaling

- 1k users → 1 server
- 10k users → 2 server + load balancer
- 100k users → 5+ server + CDN + Redis cluster
- 1M users → Kubernetes + Microservices

## 🆘 Yordam

- 📧 support@00o.uz
- 💬 Telegram: @kryzensys_support
- 📖 Docs: https://docs.00o.uz
- 🐛 Issues: https://github.com/KRYZENSYS/00o-platform/issues

---

**Tayyor! 🎉** Sizning 00o.uz platformangiz ishlayapti!
