# 00o.uz — Production Platform

O'zbek tilidagi eng katta onlayn platforma. Full-stack SaaS: 50+ ilova, real foydalanuvchilar, to'lov, premium.

## Arxitektura

```
00o-platform/
├── apps/
│   ├── web/              # Next.js 14 frontend (PWA)
│   ├── api/              # Fastify backend
│   └── admin/            # Admin panel
├── packages/
│   ├── database/         # Prisma + PostgreSQL
│   ├── types/            # TypeScript types
│   ├── utils/            # Shared utilities
│   ├── i18n/             # 10+ til
│   └── config/           # ESLint, TSConfig
├── docker/
│   ├── docker-compose.yml
│   └── *.Dockerfile
└── .github/workflows/    # CI/CD
```

## Texnologiyalar

- **Frontend:** Next.js 14, TypeScript, Tailwind
- **Backend:** Fastify + Prisma
- **DB:** PostgreSQL 16 + Redis
- **Auth:** JWT (access + refresh)
- **Payment:** Payme, Click, Uzum, Stripe
- **Deploy:** Docker, Railway

## Tez boshlash

```bash
git clone https://github.com/KRYZENSYS/00o-platform.git
cd 00o-platform
pnpm install
docker-compose up -d
pnpm db:migrate
pnpm dev
```

## Status

- [x] Repository yaratildi
- [ ] Database schema
- [ ] Auth tizimi
- [ ] Asosiy API
- [ ] Frontend (Next.js)
- [ ] To'lov integratsiyasi
- [ ] Deploy
