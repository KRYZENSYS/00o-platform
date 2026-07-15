/**
 * Users routes
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  language: z.enum(['uz', 'ru', 'en']).optional(),
});

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    return reply.send({ success: true, data: (req as any).user });
  });

  app.put('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = updateProfileSchema.parse(req.body);
    return reply.send({ success: true, data: body });
  });

  app.get('/:id', async (req, reply) => {
    return reply.send({ success: true, data: { id: (req.params as any).id } });
  });

  app.get('/:id/posts', async (req, reply) => {
    return reply.send({ success: true, data: [] });
  });
};

export default usersRoutes;
