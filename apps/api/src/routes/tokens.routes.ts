/**
 * Tokens routes — internal economy
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const purchaseSchema = z.object({
  amount: z.number().int().positive().min(100).max(100000),
  method: z.enum(['PAYME', 'CLICK', 'STRIPE', 'UZCARD', 'CARD']),
});

const tokensRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.authenticate);

  app.get('/balance', async (req, reply) =>
    reply.send({ success: true, data: { balance: 0 } }),
  );
  app.get('/history', async (req, reply) =>
    reply.send({ success: true, data: [] }),
  );
  app.post('/purchase', async (req, reply) => {
    const body = purchaseSchema.parse(req.body);
    return reply.send({ success: true, data: body });
  });
  app.post('/transfer', async (req, reply) => {
    return reply.send({ success: true, message: 'Transfer' });
  });
};

export default tokensRoutes;
