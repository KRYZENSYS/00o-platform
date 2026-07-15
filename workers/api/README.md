# 00o.uz API — Cloudflare Workers

Hono + D1 + R2 + KV asosida qurilgan edge API.

## 🚀 Quick Deploy

```bash
# 1. Cloudflare login
npx wrangler login

# 2. D1 database yaratish
npx wrangler d1 create 00o-db
# database_id ni wrangler.toml ga qo'ying

# 3. Schema yuklash
npm run db:migrate

# 4. Seed data
npm run db:seed

# 5. Secrets sozlash
npx wrangler secret put JWT_ACCESS_SECRET
npx wrangler secret put JWT_REFRESH_SECRET
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN

# 6. Deploy
npm run deploy
```

## 📡 Endpoints

| Method | Path | Auth | Tavsif |
|--------|------|------|--------|
| GET | `/health` | ❌ | Health check |
| POST | `/api/v1/auth/register` | ❌ | Ro'yxatdan o'tish |
| POST | `/api/v1/auth/login` | ❌ | Login |
| GET | `/api/v1/users/me` | ✅ | Joriy user |
| GET | `/api/v1/startups` | ❌ | Startup'lar |
| POST | `/api/v1/startups` | ✅ | Startup yaratish |
| GET | `/api/v1/posts` | ❌ | Postlar |
| POST | `/api/v1/posts` | ✅ | Post yaratish |
| GET | `/api/v1/feed` | ❌ | Feed |
| GET | `/api/v1/jobs` | ❌ | Vakansiyalar |
| POST | `/api/v1/jobs` | ✅ | Vakansiya qo'shish |
| GET | `/api/v1/marketplace` | ❌ | E'lonlar |
| POST | `/api/v1/marketplace` | ✅ | E'lon qo'shish |
| GET | `/api/v1/investors` | ❌ | Investorlar |
| POST | `/api/v1/ai/chat` | ✅ | AI chat (Groq) |
| GET | `/api/v1/ai/models` | ❌ | AI modellar |
| GET | `/api/v1/chats` | ✅ | Chatlar |
| GET | `/api/v1/chats/:id/messages` | ✅ | Xabarlar |
| GET | `/api/v1/subscriptions/plans` | ❌ | Planlar |

## 💰 Narxlar

| Xizmat | Bepul limit | Narxi |
|--------|------------|-------|
| Workers | 100,000 req/kun | $0.30/M |
| D1 | 5GB saqlash, 5M read/kun | $0.75/M |
| R2 | 10GB saqlash | $0.015/GB |
| KV | 100K read/kun | $0.50/M |
| **Jami minimal** | | **$0/oy** |
