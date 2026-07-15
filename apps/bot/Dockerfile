# 00o.uz Bot — multi-stage Dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/bot/package.json ./apps/bot/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @00o/bot build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/apps/bot/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER nodejs
CMD ["node", "dist/index.js"]
