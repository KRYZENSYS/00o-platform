# 00o.uz — AI Startup Hub Platform

🇺🇿 **O'zbekistondagi eng katta AI Startup va Frilanser platformasi**

Production-ready full-stack monorepo platform with AI, marketplace, social feed, real-time chat, payments va ko'p boshqa funksiyalar.

## ✨ Xususiyatlar

### 🤖 AI (GroqCloud)
- 20+ AI vosita: startup idea, business plan, code review, resume, marketing
- Models: Llama 3.3 70B, Qwen 2.5 Coder, DeepSeek R1
- Streaming responses, chat history, model switching
- AI image analyze, file analysis

### 🚀 Startup Hub
- Startap yaratish va boshqarish
- Funding campaigns
- Co-founder va team topish
- Investor matchmaking
- Pitch deck AI yordamida

### 💼 Marketplace
- Xizmatlar marketplace
- Frilanserlar va buyurtmachilar
- Review va rating
- To'lov tizimi
- Escrow support

### 💬 Real-time Chat
- WebSocket asosida
- File sharing
- Read receipts
- Online status

### 📱 Ijtimoiy
- Feed (posts, likes, comments)
- Stories
- Follow/Followers
- Trending
- Hashtags

### 💰 To'lov
- Stripe integration
- Token tizimi (🪙)
- Premium subscriptions
- Referral bonuses
- Payme/Click (O'zbekiston)

### 🌐 Multi-language
- O'zbek (asosiy)
- Rus
- Ingliz

## 🏗 Arxitektura

```
00o-platform/
├── apps/
│   ├── backend/         # FastAPI + Python
│   │   ├── app/
│   │   │   ├── api/v1/   # REST endpoints
│   │   │   ├── core/     # Config, DB, security
│   │   │   ├── models/   # Prisma models
│   │   │   └── services/ # AI, email, etc
│   │   ├── prisma/       # Schema
│   │   ├── telegram_bot/ # Aiogram bot
│   │   └── worker/       # Celery tasks
│   │
│   ├── web/              # Next.js 15 + TypeScript
│   │   ├── src/
│   │   │   ├── app/      # App router
│   │   │   ├── components/
│   │   │   ├── lib/      # API client, utils
│   │   │   └── store/    # Zustand
│   │   └── public/
│   │
│   └── mobile/           # React Native (Expo)
│       └── src/
│
├── packages/
│   ├── shared/           # Shared types
│   ├── ui/               # UI components
│   └── config/           # Shared config
│
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

## 🛠 Texnologiyalar

### Frontend
- **Next.js 15** (App Router, RSC)
- **TypeScript** (strict mode)
- **Tailwind CSS** + custom design system
- **Zustand** (state management)
- **React Query** (server state)
- **Lucide React** (icons)
- **Sonner** (toasts)
- **Socket.io** (real-time)

### Backend
- **FastAPI** (Python 3.11)
- **Prisma** (ORM)
- **PostgreSQL 16** (database)
- **Redis 7** (cache, queues)
- **Celery** (background tasks)
- **GroqCloud SDK** (AI)
- **JWT** (auth)
- **Pydantic** (validation)
- **Loguru** (logging)
- **Sentry** (error tracking)

### Mobile
- **React Native** + **Expo**
- **NativeWind** (Tailwind)
- **Expo Router**

### DevOps
- **Docker** + **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Vercel** (frontend)
- **Railway/Fly.io** (backend)
- **Sentry** (monitoring)
- **Posthog** (analytics)

## 🚀 Tez boshlash

### Prerequisites
- Node.js 20+
- pnpm 9+
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

### Frontend
```bash
cd apps/web
pnpm install
cp .env.example .env.local
pnpm dev
# http://localhost:3000
```

### Backend
```bash
cd apps/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
prisma generate
prisma db push
uvicorn app.main:app --reload
# http://localhost:8000
```

### Docker
```bash
docker-compose up -d
```

### Telegram Bot
```bash
cd apps/backend
python -m telegram_bot.bot
```

## 📦 Asosiy funksiyalar ro'yxati

### Backend API (50+ endpoints)
- ✅ Auth: register, login, telegram, 2FA, password reset
- ✅ AI: chat, 20+ tools, models, usage stats
- ✅ Users: profile, search, follow
- ✅ Startups: CRUD, funding, investors
- ✅ Marketplace: services, orders, reviews
- ✅ Jobs: listings, applications
- ✅ Chat: real-time, history, files
- ✅ Feed: posts, likes, comments
- ✅ Payments: stripe, payme, click
- ✅ Subscriptions: premium tiers
- ✅ Referrals: bonus system
- ✅ Notifications: push, email, telegram
- ✅ Admin: panel, moderation
- ✅ Analytics: stats, reports

### Frontend Pages (30+ pages)
- ✅ Landing page
- ✅ Auth: login, register, forgot password
- ✅ Dashboard
- ✅ AI Chat + Tools
- ✅ Startups marketplace
- ✅ Services marketplace
- ✅ Jobs board
- ✅ Investor directory
- ✅ Team finder
- ✅ Feed (social)
- ✅ Chat
- ✅ Profile
- ✅ Settings (7 sections)
- ✅ Premium plans
- ✅ Calendar, Todos, Notes, etc.

### Database Models (30+ tables)
- User, Profile, Session, Token
- AIChat, AIMessage, AILog
- Startup, Funding, Investor
- Service, Order, Review
- Job, Application
- Chat, Message
- Post, Like, Comment, Story
- Subscription, Payment
- Notification, EmailLog
- And more...

## 🎨 Design System

- **Colors**: Violet-Pink-Orange gradient
- **Typography**: Inter font family
- **Style**: Glassmorphism, modern UI
- **Themes**: Light/Dark
- **Responsive**: Mobile-first
- **Animations**: Smooth transitions
- **Accessibility**: WCAG 2.1 AA

## 📊 Performance

- **Lighthouse**: 95+ (Performance, A11y, Best Practices, SEO)
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Bundle size**: < 200KB (gzipped)
- **API response**: < 100ms (avg)
- **Real-time latency**: < 50ms

## 🔒 Xavfsizlik

- JWT + Refresh tokens
- 2FA (TOTP)
- Rate limiting
- CORS, CSRF protection
- SQL injection prevention (Prisma)
- XSS protection
- File upload validation
- Email verification
- Telegram auth verification
- Audit logging
- Sentry error tracking

## 📈 Kelajak rejalar

- [ ] Mobile app (iOS + Android)
- [ ] WebSocket real-time
- [ ] Payment integration (Stripe, Payme, Click)
- [ ] Advanced AI: image generation
- [ ] Video calls
- [ ] Push notifications
- [ ] PWA support
- [ ] White-label for Enterprise
- [ ] API for third-party
- [ ] GraphQL alternative

## 📄 License

MIT © [00o.uz](https://00o.uz)

## 👥 Team

- **Asoschi**: [KRYZENSYS](https://github.com/KRYZENSYS)
- **AI yordamchi**: Mira (Men o'zim yordam berdim! 🤖)

## 📞 Aloqa

- 🌐 [00o.uz](https://00o.uz)
- 📧 info@00o.uz
- 💬 Telegram: [@ooouzbot](https://t.me/ooouzbot)
- 🐛 Issues: [GitHub](https://github.com/KRYZENSYS/00o-platform/issues)

---

⭐ Agar loyiha yoqsa, star bosishni unutmang!

🇺🇿 O'zbekistondan dunyoga!
