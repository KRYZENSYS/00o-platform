/**
 * Auth plugin — preHandler for protected routes
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../lib/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';

export async function authPlugin(app: FastifyInstance) {
  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      const auth = request.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid Authorization header');
      }
      const token = auth.slice(7);
      const payload = verifyAccessToken(token);
      (request as any).user = payload;
    } catch (e) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  });

  app.decorate('requireAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required');
    }
  });

  app.decorate('requirePremium', async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || (user.role !== 'PREMIUM' && user.role !== 'ADMIN')) {
      throw new ForbiddenError('Premium subscription required');
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePremium: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
