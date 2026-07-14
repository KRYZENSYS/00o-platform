# @00o/database

Prisma + PostgreSQL database layer for 00o.uz platform.

## Tables (30+)

### Auth & Users
- `users` - Asosiy foydalanuvchilar
- `profiles` - Profil ma'lumotlari
- `sessions` - Faol sessiyalar
- `refresh_tokens` - JWT refresh tokens
- `login_attempts` - Login tarixi
- `password_resets` - Parol tiklash
- `email_verifications` - Email tasdiqlash
- `phone_verifications` - Telefon tasdiqlash
- `devices` - Qurilmalar
- `push_subscriptions` - Push notifications

### Productivity
- `todos` - Vazifalar
- `notes` - Eslatmalar
- `password_entries` - Parol menejeri
- `habits` - Odatlar
- `habit_logs` - Odat tarixi
- `bookmarks` - Xatcho'plar
- `calendar_events` - Kalendar

### Finance
- `transactions` - Tranzaksiyalar
- `budgets` - Byudjetlar

### Health
- `workout_logs` - Mashqlar
- `water_logs` - Suv
- `sleep_logs` - Uyqu
- `mood_logs` - Kayfiyat
- `meditation_logs` - Meditatsiya

### Social
- `posts` - Postlar
- `comments` - Kommentlar
- `likes` - Layklar
- `follows` - Obunalar
- `stories` - Storialar
- `story_views` - Ko'rishlar
- `conversations` - Suhbatlar
- `messages` - Xabarlar
- `notifications` - Bildirishnomalar
- `blocks` - Bloklar
- `reports` - Shikoyatlar

### Media
- `media` - Yuklangan fayllar

### Gamification
- `achievements` - Yutuqlar
- `user_achievements` - Foydalanuvchi yutuqlari
- `xp_logs` - XP tarixi

### Payments
- `subscriptions` - Obunalar
- `payments` - To'lovlar
- `invoices` - Hisob-fakturalar
- `api_keys` - API kalitlar

### System
- `audit_logs` - Audit jurnali

## Commands

```bash
pnpm migrate         # Migratsiya yaratish
pnpm migrate:deploy  # Production migratsiya
pnpm generate        # Prisma client generate
pnpm studio          # Prisma Studio (GUI)
pnpm seed            # Seed data
```
