/**
 * Feed routes — public posts
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  images: z.array(z.string().url()).max(10).default([]),
  type: z.enum(['GENERAL', 'STARTUP_UPDATE', 'JOB', 'ANNOUNCEMENT']).default('GENERAL'),
});

const feedRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => reply.send({ success: true, data: [] }));
  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = createPostSchema.parse(req.body);
    return reply.send({ success: true, data: body });
  });
  app.post('/:id/like', { preHandler: [app.authenticate] }, async (req, reply) =>
    reply.send({ success: true, message: 'Liked' }),
  );
};

export default feedRoutes;
