/**
 * Payment routes — Stripe/Payme/Click
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createPaymentSchema = z.object({
  plan: z.enum(['PRO', 'BUSINESS']),
  amount: z.number().int().positive(),
  method: z.enum(['PAYME', 'CLICK', 'STRIPE', 'UZCARD']),
});

const paymentRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/create',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const body = createPaymentSchema.parse(req.body);
      return reply.send({ success: true, data: { paymentId: 'demo', ...body } });
    },
  );

  app.post(
    '/webhook/payme',
    async (req, reply) => {
      return reply.send({ success: true });
    },
  );

  app.post(
    '/webhook/click',
    async (req, reply) => {
      return reply.send({ success: true });
    },
  );
};

export default paymentRoutes;
