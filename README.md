# 00o.uz — O'zbek tilidagi eng katta onlayn platforma

AI-powered startup ecosystem platform for Uzbekistan. Frontend Next.js 15, Backend Fastify (Node.js), DB PostgreSQL, AI Groq Cloud.

## 🏗 Monorepo Structure

```
00o-platform/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   ├── api/          # Fastify backend API
│   └── bot/          # Telegram bot
├── packages/         # Shared packages
│   ├── database/     # Prisma client
│   ├── utils/        # Shared utilities
│   └── types/        # Shared TypeScript types
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docs/             # Documentation
```

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Generate Prisma client + migrate
pnpm prisma:generate
pnpm prisma:migrate

# 4. Start all services
pnpm dev

# 5. Open browser
# Web:      http://localhost:3000
# API:      http://localhost:4000
# API Docs: http://localhost:4000/docs
```

## 🚀 Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed production deployment guide.

Quick deploy:
- **Frontend:** Vercel (auto-detect Next.js)
- **Backend:** Railway / Render / Fly.io
- **Database:** PostgreSQL (Neon / Supabase / Railway)

## 📊 Project Status

See [STATUS.md](./STATUS.md) for current progress.
See [AUDIT.md](./AUDIT.md) for code audit report.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT © [KRYZENSYS](https://github.com/KRYZENSYS)

## 📞 Contact

- Telegram: @mira_support_team
- GitHub: https://github.com/KRYZENSYS/00o-platform
- Website: https://00o.uz (coming soon)
