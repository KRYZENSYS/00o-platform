// 00o.uz - Fastify server
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

const PORT = parseInt(process.env.PORT_API || '4000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  keyPrefix: 'oo:',
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
        description: 'O\'zbek tilidagi eng katta onlayn platforma API',
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
      return { ready: true, redis: 'ok' };
    } catch (err) {
      return { ready: false, redis: 'down' };
    }
  });

  // ===== Auth decorator =====
  app.decorate('authenticate', async (req: any, reply: any) => {
    try { await req.jwtVerify(); }
    catch (err) { return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' }); }
  });

  // ===== Routes =====
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(userRoutes, { prefix: '/api/v1/users' });
  await app.register(todoRoutes, { prefix: '/api/v1/todos' });
  await app.register(noteRoutes, { prefix: '/api/v1/notes' });
  await app.register(habitRoutes, { prefix: '/api/v1/habits' });
  await app.register(postRoutes, { prefix: '/api/v1/posts' });
  await app.register(chatRoutes, { prefix: '/api/v1/chat' });
  await app.register(paymentRoutes, { prefix: '/api/v1/payments' });
  await app.register(uploadRoutes, { prefix: '/api/v1/upload' });
  await app.register(adminRoutes, { prefix: '/api/v1/admin' });

  // ===== Error handler =====
  app.setErrorHandler((error, req, reply) => {
    req.log.error(error);
    if (error.validation) {
      return reply.code(400).send({ error: 'ValidationError', details: error.validation });
    }
    if (error.statusCode === 429) {
      return reply.code(429).send({ error: 'TooManyRequests', message: 'Rate limit exceeded' });
    }
    reply.code(error.statusCode || 500).send({
      error: error.name || 'InternalError',
      message: NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  });

  return app;
}

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`🚀 00o.uz API running at http://localhost:${PORT}`);
    app.log.info(`📚 Docs at http://localhost:${PORT}/docs`);
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => { await redis.quit(); process.exit(0); });
process.on('SIGTERM', async () => { await redis.quit(); process.exit(0); });

start();

// Type augmentation
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: any, reply: any) => Promise<void>;
  }
}
