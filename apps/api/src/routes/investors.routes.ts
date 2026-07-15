/**
 * Investors routes
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const investorSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().min(10).max(1000).optional(),
  websiteUrl: z.string().url().optional(),
  focusAreas: z.array(z.string()).max(10).default([]),
  ticketSizeMin: z.number().int().positive().optional(),
  ticketSizeMax: z.number().int().positive().optional(),
  currency: z.enum(['UZS', 'USD']).default('USD'),
});

const investorsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => reply.send({ success: true, data: [] }));
  app.get('/:id', async (req, reply) =>
    reply.send({ success: true, data: { id: (req.params as any).id } }),
  );
  app.post('/', { preHandler: [app.authenticate, app.requirePremium] }, async (req, reply) => {
    const body = investorSchema.parse(req.body);
    return reply.send({ success: true, data: body });
  });
};

export default investorsRoutes;
