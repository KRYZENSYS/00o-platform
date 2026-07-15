/**
 * Startups routes
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createStartupSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(5000),
  industry: z.string().max(50).optional(),
  stage: z.enum(['IDEA', 'MVP', 'EARLY', 'GROWTH', 'SCALE']).default('IDEA'),
  websiteUrl: z.string().url().optional(),
  fundingGoal: z.number().int().positive().optional(),
});

const startupsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => reply.send({ success: true, data: [] }));
  app.get('/:id', async (req, reply) =>
    reply.send({ success: true, data: { id: (req.params as any).id } }),
  );
  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = createStartupSchema.parse(req.body);
    return reply.send({ success: true, data: body });
  });
};

export default startupsRoutes;
