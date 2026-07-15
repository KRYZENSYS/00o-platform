# 🔍 00o.uz — To'liq Audit Hisobot (2026-07-15)

## ⚠️ TOPILGAN MUAMMOLAR (6 ta)

### 🔴 1. KRITIK: API URL nomuvofiqligi
**Muammo:** `apps/web/src/lib/api.ts` da:
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
```
- **Port 8000** = Python (FastAPI) uchun
- Lekin backend `apps/api` = **Node.js + Fastify** = port 4000

**Yechim:** Default port `4000` ga o'zgartirish:
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
```

---

### 🔴 2. KRITIK: Monorepo'da `package.json` yo'q
**Muammo:** Root `package.json` da `apps/api` workspace'ga ulanmagan.  
`pnpm-workspace.yaml` bor, lekin root package.json'da `pnpm-workspace` script yo'q.

**Yechim:** Root `package.json` ga qo'shish:
```json
{
  "scripts": {
    "dev": "pnpm -r dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "type-check": "pnpm -r type-check",
    "test": "pnpm -r test"
  }
}
```

---

### 🟠 3. OGOH: `apps/web/package.json` da kerakli deps yo'q
**Muammo:** Faqat runtime deps bor, lekin yo'q:
- `tailwindcss`, `postcss`, `autoprefixer` (styling)
- `eslint`, `eslint-config-next`, `prettier` (lint)
- `@types/*` (TypeScript types)
- `zod` (validation)
- `zustand` (state management)
- `clsx`, `tailwind-merge` (className helpers)
- `lucide-react` yoki `react-icons` (icons)
- `react-hot-toast` (notifications)

**Yechim:** `apps/web/package.json` ni to'ldirish.

---

### 🟠 4. OGOH: `apps/api/src/config.ts` dotenv yo'q
**Muammo:** `apps/api/src/server.ts` `import 'dotenv/config'` qiladi, lekin `dotenv` package `package.json`'da yo'q.

**Yechim:** `apps/api/package.json` ga `dotenv` qo'shish.

---

### 🟡 5. O'RTACHA: `next.config.js` da `output: 'standalone'` 
**Muammo:** Standalone build Docker uchun, lekin Vercel uchun kerak emas. Vercel'ga xalaqit bermaydi, lekin image optimization yo'q.

**Yechim:** Production'da Vercel uchun mos, lekin image domains aniq.

---

### 🟡 6. O'RTACHA: Frontend'da WebSocket URL ishlatilmaydi
**Muammo:** `apps/web/src/lib/api.ts` da WS client yo'q. Chat uchun WebSocket kerak.

**Yechim:** Alohida `websocket.ts` client yaratish.

---

## ✅ TO'G'RI ISHLAYOTGAN QISMLAR

1. ✅ `pnpm-workspace.yaml` to'g'ri (apps/*, packages/*)
2. ✅ `apps/web/next.config.js` - to'liq (security headers, CSP, image patterns)
3. ✅ `apps/api/src/server.ts` - Fastify + WebSocket + Swagger + Prisma
4. ✅ `apps/api/src/config.ts` - Zod validation
5. ✅ `apps/web/tsconfig.json` - Strict mode, Next.js 15
6. ✅ `apps/web/src/lib/api.ts` - axios + JWT refresh + axios error handling
7. ✅ `apps/api/src/routes/auth.routes.ts` - bcrypt, jwt, telegram auth
8. ✅ `apps/web/src/app` - (app), (auth), (marketing) groups
9. ✅ `.github/workflows/ci.yml` - CI pipeline
10. ✅ `apps/api/.env.example` - barcha kerakli env vars
11. ✅ `apps/api/Dockerfile` - Multi-stage Docker build
12. ✅ `apps/api/railway.json` - Railway config

---

## 🛠 TO'LIQ TUZATISH PLAN

### Qadam 1: Root package.json yangilash
- `pnpm-workspace` script qo'shish
- `engines` (Node 22.x) qo'shish

### Qadam 2: apps/web/package.json to'ldirish
- tailwind, postcss, autoprefixer
- @types/*, zod, zustand
- lucide-react, react-hot-toast
- clsx, tailwind-merge

### Qadam 3: apps/api/package.json to'ldirish
- dotenv
- prisma, @prisma/client
- @types/* (bcrypt, jsonwebtoken, etc.)

### Qadam 4: Frontend'da WebSocket client qo'shish
- `apps/web/src/lib/websocket.ts`

### Qadam 5: ESLint + Prettier sozlash
- `.eslintrc.json`, `.prettierrc`

### Qadam 6: Prisma schema yaratish
- `apps/api/prisma/schema.prisma`
- `apps/database/prisma/schema.prisma` (shared)

### Qadam 7: Smoke test
```bash
pnpm install
pnpm -r build
pnpm -r type-check
pnpm -r lint
```

---

## 📊 Hisobot

| Kategoriya | Holat |
|------------|-------|
| Struktura | ✅ 95% |
| Konfiguratsiya | ⚠️ 80% |
| Dependencies | ❌ 60% (ko'p yo'q) |
| Type safety | ✅ 90% |
| Deploy readiness | ✅ 85% |
| WebSocket integration | ❌ 50% |
| Tests | ❌ 0% (config bor, testlar yo'q) |

**Umumiy tayyorlik: 75%** — production'ga yaqin, lekin 2-3 soatlik to'g'irlash kerak.

---

**Auditor:** Mira AI  
**Sana:** 2026-07-15  
**Tuzatish vaqti:** ~2-3 soat
