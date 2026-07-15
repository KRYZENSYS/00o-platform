# 🚀 00o.uz — Production Deploy Guide

## ⚡ Quick Start (5 daqiqada)

### 1. Vercel (Frontend)
```bash
# 1. Vercel'ga kiring: https://vercel.com
# 2. "New Project" → GitHub → KRYZENSYS/00o-platform
# 3. Root Directory: apps/web
# 4. Framework: Next.js (auto-detect)
# 5. Build Command: cd ../.. && pnpm install && pnpm --filter web build
# 6. Install Command: cd ../.. && pnpm install --no-frozen-lockfile
# 7. Output Directory: .next
```

**Environment Variables (Vercel Dashboard):**
```env
NEXT_PUBLIC_API_URL=https://api.00o.uz
NEXT_PUBLIC_WS_URL=wss://api.00o.uz
NEXT_PUBLIC_APP_URL=https://00o.uz
```

### 2. Backend (Railway / Render / Fly.io)

**Eng oson — Railway.app:**
```bash
# 1. https://railway.app → New Project → GitHub Repo
# 2. Root: apps/api
# 3. Add Postgres plugin (free tier)
# 4. Add Redis plugin (free tier)
# 5. Environment Variables:
DATABASE_URL=postgresql://...   # Railway avtomatik beradi
REDIS_URL=redis://...           # Railway avtomatik beradi
SECRET_KEY=your-super-secret-key-min-32-chars
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=gsk_...
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_BOT_USERNAME=ooouzbot
FRONTEND_URL=https://00o.uz
CORS_ORIGINS=https://00o.uz,https://www.00o.uz
ENVIRONMENT=production
```

### 3. Database Setup
```bash
# Railway terminal'da:
cd apps/api
pip install -r requirements.txt
alembic upgrade head
python -m app.scripts.seed_data  # Test data
```

### 4. Domain
- Vercel: `00o.uz` + `www.00o.uz`
- Railway: `api.00o.uz`

DNS:
```
A     @           76.76.21.21         (Vercel)
CNAME www         cname.vercel-dns.com (Vercel)
CNAME api         <railway-app>.up.railway.app
```

## 🔒 GitHub Integration (Private Repo Deploy)

Agar Vercel'da private repo deploy qilinsa:
1. Vercel Dashboard → Settings → Git → "Install GitHub App"
2. GitHub → Settings → Applications → Vercel → Repository access
3. `00o-platform` ni tanlang
4. "Save" → Qayta deploy

## 📊 Monitoring
- Sentry: `SENTRY_DSN` env qo'shing
- Vercel Analytics: Dashboard'da yoqish
- Railway Metrics: Built-in
- UptimeRobot: https://uptimerobot.com (free)

## 🧪 Smoke Test
```bash
curl https://api.00o.uz/health
curl https://00o.uz
```

## 🔄 CI/CD
GitHub Actions `.github/workflows/ci.yml` mavjud:
- PR ochilganda: lint + type-check + build
- Main branch'ga merge: auto-deploy Vercel + Railway

## 📞 Support
- Telegram: @ooouz_support
- Email: hello@00o.uz
- Issues: https://github.com/KRYZENSYS/00o-platform/issues
