# 🤝 Contributing to 00o.uz

00o.uz — O'zbek tilidagi eng katta onlayn platforma. Hissa qo'shishingiz mamnuniyat!

## 🚀 Tez boshlash

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'feat: Add AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📋 Commit conventions

[Conventional Commits](https://www.conventionalcommits.org/) ishlatamiz:

```
feat: yangi funksiya
fix: xatolik tuzatish
docs: hujjatlar
style: formatlash
refactor: kod qayta yozish
test: testlar
chore: texnik ishlar
```

## 🧪 Test

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

## 📏 Code style

- ESLint + Prettier
- TypeScript strict mode
- Pre-commit: husky + lint-staged

## 🏗 Arxitektura

```
apps/
  web/      — Next.js frontend
  api/      — Fastify backend
  bot/      — Telegram bot
packages/
  database/ — Prisma client
  utils/    — Umumiy utilitylar
  types/    — TypeScript types
```

## 🌐 Til qo'llab-quvvatlash

- O'zbek (asosiy) — `uz`
- Rus — `ru`
- Ingliz — `en`

Yangi til qo'shish uchun: `apps/web/src/lib/i18n.ts`.

## 📞 Aloqa

- Telegram: @mira_support_team
- GitHub Issues: github.com/KRYZENSYS/00o-platform/issues

---

Rahmat! ❤️
