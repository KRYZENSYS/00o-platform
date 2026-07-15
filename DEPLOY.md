# 🚀 00o.uz — Deployment Guide

Production deployment uchun to'liq qo'llanma.

## 📋 Kerakli xizmatlar

| Xizmat | Maqsad | Bepul tier | Tavsiya |
|--------|--------|-----------|---------|
| **Vercel** | Frontend (Next.js) | ✅ | Production uchun eng yaxshi |
| **Railway** | Backend (Fastify) | ✅ $5 credit | Oddiy deploy |
| **Neon** | PostgreSQL DB | ✅ 0.5GB | Serverless Postgres |
| **Upstash** | Redis | ✅ 10K cmd/day | Serverless |
| **Telegram** | Bot | ✅ | @BotFather |
| **Groq** | AI | ✅ 14,400 req/day | LLM inference |
| **Cloudflare R2** | Storage | ✅ 10GB | S3-compatible |
| **Sentry** | Monitoring | ✅ 5K events | Error tracking |

## 🔐 1. Environment variables

### apps/web/.env.production
```bash
NEXT_PUBLIC_API_URL=https://api.00o.uz/api/v1
NEXT_PUBLIC_WS_URL=wss://api.00o.uz/ws
NEXT_PUBLIC_APP_URL=https://00o.uz
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=ooouzbot
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### apps/api/.env.production
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=redis://default:pass@host:6379
JWT_ACCESS_SECRET=<openssl rand -hex 64>
JWT_REFRESH_SECRET=<openssl rand -hex 64>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
GROQ_API_KEY=gsk_xxx
TELEGRAM_BOT_TOKEN=123456:ABC
ALLOWED_ORIGINS=https://00o.uz,https://www.00o.uz
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1 minute
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### apps/bot/.env.production
```bash
BOT_TOKEN=123456:ABC
WEBAPP_URL=https://00o.uz
API_URL=https://api.00o.uz/api/v1
NODE_ENV=production
```

## 🚀 2. Frontend (Vercel)

```bash
# 1. Vercel CLI install
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# Vercel dashboard:
# - Root: apps/web
# - Framework: Next.js
# - Build cmd: cd ../.. && pnpm install && pnpm --filter web build
# - Install cmd: pnpm install
# - Output: .next
```

Yoki **GitHub integration**: Vercel dashboard → New Project → Import `KRYZENSYS/00o-platform` → root: `apps/web`.

## 🐳 3. Backend (Railway / Fly.io / Render)

### Option A: Railway
1. railway.app → New Project → Deploy from GitHub
2. Repo: `KRYZENSYS/00o-platform`
3. Root: `apps/api`
4. Build cmd: `pnpm install && pnpm prisma:generate && pnpm build`
5. Start cmd: `node dist/server.js`
6. Add PostgreSQL plugin
7. Add Redis plugin
8. Set env vars (yuqoridagi)

### Option B: Fly.io
```bash
fly launch
fly secrets set DATABASE_URL=... JWT_ACCESS_SECRET=...
fly deploy
```

### Option C: Docker (VPS)
```bash
git clone https://github.com/KRYZENSYS/00o-platform.git
cd 00o-platform
cp .env.example .env
# ... edit .env
docker-compose up -d
```

## 🗄 4. Database (Neon)

1. https://neon.tech → Sign up
2. Create project `00o-prod`
3. Copy connection string → `DATABASE_URL`
4. Run migrations:
   ```bash
   pnpm --filter @00o/api prisma migrate deploy
   pnpm --filter @00o/api prisma db seed
   ```

## 📦 5. Storage (Cloudflare R2)

1. https://dash.cloudflare.com → R2 → Create bucket `00o-uploads`
2. Get access key & secret
3. Configure CORS
4. Public domain: `https://cdn.00o.uz`

## 🤖 6. Telegram Bot

1. @BotFather → `/newbot` → `00o.uz Bot`
2. Set webhook:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://api.00o.uz/telegram/webhook"
   ```
3. Set bot menu button → `https://00o.uz`

## 🌐 7. Domain (Cloudflare)

1. Add `00o.uz` to Cloudflare
2. DNS:
   - `00o.uz` → Vercel (CNAME)
   - `api.00o.uz` → Railway/Fly (CNAME)
   - `cdn.00o.uz` → R2 (CNAME)

## 📊 8. Monitoring

- **Sentry**: https://sentry.io → New project → DSN to env
- **Uptime**: https://uptime.com → Add monitor
- **Logs**: Railway/Fly.io dashboard
- **Analytics**: Plausible / Umami (privacy-friendly)

## ✅ 9. Deploy checklist

- [ ] All env vars set
- [ ] JWT secrets generated (64+ chars)
- [ ] DB migrations run
- [ ] Seed data loaded
- [ ] Telegram webhook set
- [ ] CORS configured (only production domains)
- [ ] Rate limiting enabled
- [ ] HTTPS everywhere
- [ ] Sentry DSN configured
- [ ] Backups enabled (DB)
- [ ] Custom domain connected
- [ ] SEO (sitemap.xml, robots.txt, OG tags)
- [ ] Health check endpoints

## 🔄 10. CI/CD (GitHub Actions)

`.github/workflows/ci.yml` is configured:
- Lint + type check on every PR
- Tests on every PR
- Build verification

Vercel/Railway auto-deploy from `main` branch.

## 🆘 Troubleshooting

**API not connecting from web?**
- CORS: `ALLOWED_ORIGINS` env'da to'g'ri domen
- HTTPS: API HTTPS'da ishlashi kerak
- Check `/health` endpoint

**Telegram bot not responding?**
- Webhook to'g'ri o'rnatilganmi?
- `BOT_TOKEN` to'g'rimi?
- https://api.telegram.org/bot<TOKEN>/getWebhookInfo

**Prisma migration fails?**
- `DATABASE_URL` to'g'rimi?
- DB accessible from deploy server?
- Try: `pnpm prisma migrate reset` (CAUTION: drops data)

## 📞 Support

- Telegram: @mira_support_team
- GitHub Issues: https://github.com/KRYZENSYS/00o-platform/issues
