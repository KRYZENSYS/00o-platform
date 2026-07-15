# 00o.uz Production Deployment Guide

## 1. Server talablari

**Minimal:**
- 2 vCPU, 4 GB RAM, 40 GB SSD
- Ubuntu 22.04 LTS yoki Debian 12
- Docker + Docker Compose

**Tavsiya:**
- 4 vCPU, 8 GB RAM, 100 GB SSD
- Ubuntu 22.04 LTS
- Backup snapshot

## 2. Domen va DNS

A yoki CNAME yozuvlarni sozlang:
```
00o.uz          A    YOUR_SERVER_IP
www.00o.uz      A    YOUR_SERVER_IP
api.00o.uz      A    YOUR_SERVER_IP
```

## 3. SSL sertifikat

Let's Encrypt orqali:
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d 00o.uz -d www.00o.uz -d api.00o.uz
sudo cp /etc/letsencrypt/live/00o.uz/fullchain.pem infra/certs/
sudo cp /etc/letsencrypt/live/00o.uz/privkey.pem infra/certs/
```

Auto-renewal:
```bash
echo "0 0 1 * * certbot renew --quiet" | sudo crontab -
```

## 4. Production .env

```bash
cp .env.example .env
nano .env
```

**Muhim o'zgartirishlar:**
- `JWT_SECRET` — kuchli 64+ belgi parol
- `POSTGRES_PASSWORD` — kuchli parol
- `GROQ_API_KEY` — https://console.groq.com dan oling
- `TELEGRAM_BOT_TOKEN` — @BotFather dan
- `CORS_ORIGINS` — faqat production domenlar
- `ENVIRONMENT=production`
- `DEBUG=False`

## 5. Deploy

```bash
# Repositoriya
git clone https://github.com/KRYZENSYS/00o-platform.git
cd 00o-platform

# Build va start
docker compose up -d --build

# Migratsiya
docker compose exec api alembic upgrade head

# Demo data (ixtiyoriy)
docker compose exec api python -m app.scripts.seed

# Loglarni ko'rish
docker compose logs -f
```

## 6. Telegram bot

1. @BotFather ga `/newbot` yuboring
2. Bot nomini kiriting: `00o.uz`
3. Username: `ooouzbot`
4. Token oling va `.env` ga qo'ying
5. WebApp URL: `/setdomain` → `00o.uz`
6. Menu button: `/setmenubutton` → WebApp URL

## 7. To'lov providerlarini sozlash

### Stripe
1. https://dashboard.stripe.com → API keys
2. Webhook yarating: `https://api.00o.uz/api/v1/payments/stripe/webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Payme.uz
1. https://payme.uz/business → Merchant
2. `.env` ga `PAYME_SECRET_KEY` qo'ying

### Click.uz
1. https://click.uz → Merchant cabinet
2. `.env` ga `CLICK_SECRET_KEY` qo'ying

## 8. Monitoring

### Health check
```bash
curl https://api.00o.uz/health
```

### Docker stats
```bash
docker stats
```

### Loglar
```bash
# API
docker compose logs -f api

# Bot
docker compose logs -f bot

# Database
docker compose logs -f postgres
```

## 9. Backup

### Avtomatik backup skript
```bash
cat > /opt/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR=/opt/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T postgres pg_dump -U postgres ooouz | gzip > $BACKUP_DIR/db_$DATE.sql.gz
# Keep last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
EOF
chmod +x /opt/backup.sh
echo "0 3 * * * /opt/backup.sh" | crontab -
```

## 10. Yangilash

```bash
cd 00o-platform
git pull origin main
docker compose up -d --build
docker compose exec api alembic upgrade head
```

## 11. Tez-tez uchraydigan muammolar

### Database connection error
```bash
docker compose ps
docker compose restart postgres
```

### Bot ishlamayapti
```bash
docker compose logs bot
# Token to'g'ri ekanligini tekshiring
```

### 502 Bad Gateway
```bash
docker compose ps
# Barcha servislar "healthy" bo'lishi kerak
```

### CORS error
`.env` da `CORS_ORIGINS` ga domen qo'shing.

## 12. Performance tuning

Nginx worker'lar:
```nginx
worker_processes auto; # CPU yadrosi soniga
worker_connections 4096;
```

PostgreSQL:
```sql
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET max_connections = 200;
```

Redis:
```
maxmemory 1gb
maxmemory-policy allkeys-lru
```

## 13. CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` yarating:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/00o-platform
            git pull
            docker compose up -d --build
            docker compose exec -T api alembic upgrade head
```

## 14. SLA

- Uptime: 99.9%
- Response time: < 200ms (p95)
- AI response: < 3s

Tabriklayman! 00o.uz production'da ishlaydi 🚀
