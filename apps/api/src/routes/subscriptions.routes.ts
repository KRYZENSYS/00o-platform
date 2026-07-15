/**
 * Subscriptions routes
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const subscribeSchema = z.object({
  planId: z.enum(['PRO', 'BUSINESS']),
  autoRenew: z.boolean().default(false),
});

const subscriptionsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/plans', async (req, reply) => {
    return reply.send({
      success: true,
      data: [
        { id: 'FREE', name: 'Free', priceUZS: 0, features: ['Basic access'] },
        { id: 'PRO', name: 'Pro', priceUZS: 49000, features: ['AI chat', 'Priority support', 'Pro badge'] },
        { id: 'BUSINESS', name: 'Business', priceUZS: 199000, features: ['All Pro', 'Team', 'API', 'Custom domain'] },
      ],
    });
  });

  app.get('/current', { preHandler: [app.authenticate] }, async (req, reply) =>
    reply.send({ success: true, data: { plan: 'FREE' } }),
  );

  app.post('/subscribe', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = subscribeSchema.parse(req.body);
    return reply.send({ success: true, data: body });
  });
};

export default subscriptionsRoutes;
