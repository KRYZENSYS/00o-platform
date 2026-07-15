# Multi-stage Dockerfile for 00o.uz API (Fastify + Prisma)
FROM node:22-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# ============== Dependencies ==============
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/database/package.json ./apps/database/ 2>/dev/null || true
COPY apps/utils/package.json ./apps/utils/ 2>/dev/null || true
COPY apps/types/package.json ./apps/types/ 2>/dev/null || true
RUN pnpm install --frozen-lockfile

# ============== Build ==============
FROM base AS build
COPY --from=deps /app/ ./
COPY . .
RUN pnpm --filter api prisma:generate 2>/dev/null || true
RUN pnpm --filter api build

# ============== Production ==============
FROM base AS production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=build --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/apps/api/prisma ./prisma 2>/dev/null || true
COPY --from=build --chown=nodejs:nodejs /app/apps/api/package.json ./
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/apps/database ./node_modules/@00o/database 2>/dev/null || true
COPY --from=build --chown=nodejs:nodejs /app/apps/utils ./node_modules/@00o/utils 2>/dev/null || true
COPY --from=build --chown=nodejs:nodejs /app/apps/types ./node_modules/@00o/types 2>/dev/null || true

USER nodejs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
