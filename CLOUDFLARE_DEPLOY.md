# ☁️ 00o.uz — Cloudflare Pages + Workers Deploy Guide

$0/oy bepul deploy — Pages + Workers + D1 + R2.

## 📋 Kerakli narsalar

- ✅ GitHub account (KRYZENSYS/00o-platform public)
- ✅ Cloudflare account (https://dash.cloudflare.com/sign-up)
- ✅ Karta kerak **emas** (bepul tier uchun)

---

## 🚀 QADAM 1: Cloudflare Pages (Frontend — 3 daqiqa)

### 1.1 Cloudflare'ga kiring
👉 https://dash.cloudflare.com

### 1.2 Pages yarating
1. Chap menyuda **"Workers & Pages"**
2. **"Create application"** → **"Pages"** tab
3. **"Connect to Git"** tanlang
4. **"GitHub"** ni tanlang → **"Authorize"**
5. **"KRYZENSYS/00o-platform"** ni tanlang
6. **"Begin setup"** bosing

### 1.3 Build sozlamalari
```
Project name:           00o-uz
Production branch:      main
Framework preset:       Next.js
Build command:          cd ../.. && pnpm install --frozen-lockfile=false && pnpm --filter web build
Build output directory: apps/web/.next
Root directory (path):  apps/web
```

### 1.4 Environment variables
**"Environment variables (advanced)"** ni oching va qo'shing:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.00o-uz.workers.dev/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `wss://api.00o-uz.workers.dev/ws` |
| `NEXT_PUBLIC_APP_URL` | `https://00o-uz.pages.dev` |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | `ooouzbot` |
| `NEXT_PUBLIC_ENABLE_AI` | `true` |
| `NEXT_PUBLIC_ENABLE_MARKETPLACE` | `true` |
| `NEXT_PUBLIC_ENABLE_JOBS` | `true` |
| `NEXT_TELEMETRY_DISABLED` | `1` |

⚠️ **MUHIM:** _headers va _redirects fayllari **avtomatik** Cloudflare tomonidan qo'llaniladi.

### 1.5 Deploy
- **"Save and Deploy"** bosing
- 2-3 daqiqa kuting
- ✅ **Sayt tayyor!** URL: `https://00o-uz.pages.dev`

---

## 🚀 QADAM 2: Cloudflare Workers (API — 5 daqiqa)

### 2.1 Worker yarating
1. **"Workers & Pages"** → **"Create"**
2. **"Create Worker"** tab
3. Name: `00o-uz-api`
4. **"Deploy"** bosing (default hello world)

### 2.2 D1 Database yarating
1. **"Workers & Pages"** → **"D1 SQL Databases"** → **"Create database"**
2. Name: `00o-db`
3. **"Create"**
4. **"Database ID"** ni copy qiling (quyidagi kerak)

### 2.3 Wrangler'da database_id ni yangilang
- `workers/api/wrangler.toml` ni oching
- `database_id = "PLACEHOLDER_WILL_BE_SET_IN_CLOUDFLARE"` o'rniga haqiqiy ID ni yozing

### 2.4 Schema va seed yuklang

**Cloudflare dashboard'da:**
1. **D1 SQL Databases** → **"00o-db"** → **"Console"** tab
2. `workers/api/schema.sql` ning content'ini copy qilib **"Execute SQL"** bosing
3. So'ng `workers/api/seed.sql` ni ham copy-paste qiling va **"Execute"** bosing

### 2.5 Secrets sozlash
Terminal'da (wrangler orqali):
```bash
# Login
npx wrangler login

# Secret qo'shish (har birini alohida)
npx wrangler secret put JWT_ACCESS_SECRET
# (64 ta belgi random string kiriting, masalan: openssl rand -hex 64)

npx wrangler secret put JWT_REFRESH_SECRET
# (boshqa 64 ta belgi random string)

npx wrangler secret put GROQ_API_KEY
# (https://console.groq.com dan olgan key)

npx wrangler secret put TELEGRAM_BOT_TOKEN
# (BotFather dan olgan token)
```

### 2.6 R2 bucket yarating (storage uchun)
1. **"R2"** → **"Create bucket"** → name: `00o-uploads`
2. `wrangler.toml` ga qo'shildi avvaldan

### 2.7 Worker kodini deploy qilish

**Variant A: GitHub orqali (tavsiya)**
- `workers/api/` papkasidagi kodni GitHub'ga push qiling
- Cloudflare dashboard'da **"Workers"** → **"00o-uz-api"** → **"Settings"** → **"Triggers"** → **"Connect GitHub"**

**Variant B: Wrangler CLI orqali**
```bash
cd workers/api
npm install
npm run db:migrate
npm run db:seed
npm run deploy
```

### 2.8 Custom route (ixtiyoriy)
- Worker URL: `https://00o-uz-api.<subdomain>.workers.dev`
- yoki custom: `api.00o.uz` (domain ulangandan keyin)

---

## 🚀 QADAM 3: Tekshirish

### 3.1 Frontend
👉 https://00o-uz.pages.dev — asosiy sahifa ochilishi kerak

### 3.2 API
👉 https://00o-uz-api.<subdomain>.workers.dev/health
JSON ko'rinishi kerak:
```json
{"status":"ok","service":"00o-api","time":1700000000000}
```

### 3.3 API test
```bash
curl https://00o-uz-api.<subdomain>.workers.dev/api/v1/startups
curl https://00o-uz-api.<subdomain>.workers.dev/api/v1/posts
curl https://00o-uz-api.<subdomain>.workers.dev/api/v1/feed
curl https://00o-uz-api.<subdomain>.workers.dev/api/v1/subscriptions/plans
```

---

## 🌍 QADAM 4: Custom Domain (ixtiyoriy — keyinroq)

1. Cloudflare'da **"Websites"** → **"Add a site"** → `00o.uz`
2. DNS sozlash:
   - `00o.uz` → CNAME: `00o-uz.pages.dev`
   - `api.00o.uz` → CNAME: `00o-uz-api.<subdomain>.workers.dev`
3. Cloudflare Pages → Custom domains → `00o.uz`
4. Worker → Triggers → Custom domain → `api.00o.uz`

---

## 📊 Monitoring

- **Cloudflare Dashboard** → Analytics → Pages / Workers
- **Logs:** Workers → Logs (real-time)
- **Errors:** Workers → Logs → filter "error"

---

## 💰 Cloudflare Bepul Tier Cheklovlari

| Xizmat | Bepul limit |
|--------|-------------|
| **Pages** | Cheksiz bandwidth, 500 build/oy |
| **Workers** | 100,000 req/kun |
| **D1** | 5GB saqlash, 5M read/kun, 100K write/kun |
| **R2** | 10GB saqlash, 10M read/oy |
| **KV** | 100K read/kun, 1K write/kun |

**00o.uz uchun** (10,000 foydalanuvchi):
- Pages: **0%** ishlatiladi
- Workers: **~5%** (5K req/kun)
- D1: **0.1%** (1GB)
- R2: **5%** (500MB rasmlar)
- **Jami: $0/oy** 💰

---

## ✅ Deploy checklist

- [ ] Cloudflare account yaratildi
- [ ] Pages deploy qilindi (00o-uz.pages.dev ishlaydi)
- [ ] Worker yaratildi
- [ ] D1 database yaratildi
- [ ] Schema yuklandi
- [ ] Seed data yuklandi
- [ ] 4 ta secret qo'yildi
- [ ] R2 bucket yaratildi
- [ ] API `/health` ishlaydi
- [ ] Frontend API'ga ulanadi

---

## 🆘 Muammolar

### "pnpm not found" build'da
- `buildCommand` ni o'zgartiring: `npm install -g pnpm && cd ../.. && pnpm install && cd apps/web && pnpm build`

### "Build failed" 
- Cloudflare Pages dashboard → Deployments → logs'ni ko'ring
- Ko'pincha `package.json` dagi dependency versiyasi xato

### API CORS xatosi
- Worker'da `ALLOWED_ORIGINS` env'ga frontend URL qo'shing
- Hozir default: `https://00o-uz.pages.dev`

### AI chat ishlamayapti
- `GROQ_API_KEY` secret to'g'ri sozlanganmi?
- https://console.groq.com → API keys → tekshiring

---

**Tabriklayman! 00o.uz Cloudflare'da ishlayapti! 🎉**
