/**
 * Marketplace routes
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().int().positive(),
  currency: z.enum(['UZS', 'USD']).default('UZS'),
  category: z.string().min(2).max(50),
  images: z.array(z.string().url()).max(10).default([]),
  location: z.string().max(100).optional(),
});

const marketplaceRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => {
    return reply.send({ success: true, data: [], message: 'Listings endpoint' });
  });

  app.get('/:id', async (req, reply) => {
    return reply.send({ success: true, data: { id: (req.params as any).id } });
  });

  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = createListingSchema.parse(req.body);
    return reply.send({ success: true, data: body, message: 'Listing created' });
  });
};

export default marketplaceRoutes;
