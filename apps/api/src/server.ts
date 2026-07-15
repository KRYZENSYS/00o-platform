// 00o.uz - Fastify server (with 120+ Tools Routes)
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import websocket from '@fastify/websocket';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Redis from 'ioredis';

import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { todoRoutes } from './routes/todo.routes';
import { noteRoutes } from './routes/note.routes';
import { habitRoutes } from './routes/habit.routes';
import { postRoutes } from './routes/post.routes';
import { chatRoutes } from './routes/chat.routes';
import { paymentRoutes } from './routes/payment.routes';
import { uploadRoutes } from './routes/upload.routes';
import { adminRoutes } from './routes/admin.routes';
import { toolsRoutes } from './routes/tools.routes';

const PORT = parseInt(process.env.PORT_API || '4000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  keyPrefix: 'o:',
  maxRetriesPerRequest: 3,
});

async function buildServer() {
  const app = Fastify({
    logger: {
      level: NODE_ENV === 'production' ? 'info' : 'debug',
      transport: NODE_ENV === 'production' ? undefined : { target: 'pino-pretty', options: { colorize: true } },
    },
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024,
  });

  // ===== Plugins =====
  await app.register(helmet, {
    contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(cors, {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
  });

  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    redis,
    keyGenerator: (req) => req.ip + ':' + (req.headers['user-agent']?.toString().slice(0, 50) || ''),
  });

  await app.register(jwt, {
    secret: process.env.JWT_ACCESS_SECRET || 'dev-secret',
    sign: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
  });

  await app.register(multipart, {
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  await app.register(websocket);

  // ===== Swagger =====
  await app.register(swagger, {
    openapi: {
      info: {
        title: '00o.uz API',
        description: 'O\'zbek tilidagi eng katta onlayn platforma API - 120+ tools',
        version: '1.0.0',
        contact: { name: 'KRYZENSYS', url: 'https://00o.uz' },
      },
      servers: [{ url: process.env.API_URL || 'http://localhost:4000' }],
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    },
  });

  await app.register(swaggerUi, { routePrefix: '/docs', uiConfig: { docExpansion: 'list', deepLinking: true } });

  // ===== Health check =====
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: NODE_ENV,
    version: '1.0.0',
  }));

  app.get('/ready', async () => {
    try {
      await redis.ping();
      return { ready: true };
    } catch {
      return { ready: false };
    }
  });

  // ===== API Routes =====
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(todoRoutes, { prefix: '/api/todos' });
  await app.register(noteRoutes, { prefix: '/api/notes' });
  await app.register(habitRoutes, { prefix: '/api/habits' });
  await app.register(postRoutes, { prefix: '/api/posts' });
  await app.register(chatRoutes, { prefix: '/api/chats' });
  await app.register(paymentRoutes, { prefix: '/api/payments' });
  await app.register(uploadRoutes, { prefix: '/api/upload' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  // ===== MEGA Tools Routes (120+ endpoints, no auth required) =====
  await app.register(toolsRoutes, { prefix: '/api' });

  // ===== 404 =====
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({
      error: 'Not Found',
      message: `Route ${req.method} ${req.url} not found`,
      hint: 'See /api/tools/docs for all 120+ available tools',
    });
  });

  return app;
}

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`🚀 00o.uz API server listening on port ${PORT}`);
    app.log.info(`📚 Docs: http://localhost:${PORT}/docs`);
    app.log.info(`🛠️  Tools: http://localhost:${PORT}/api/tools/list`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
