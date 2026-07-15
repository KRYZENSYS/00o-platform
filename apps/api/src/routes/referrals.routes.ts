/**
 * Referrals routes
 */
import { FastifyPluginAsync } from 'fastify';

const referralsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.authenticate);

  app.get('/code', async (req, reply) => {
    return reply.send({ success: true, data: { code: 'DEMO123' } });
  });

  app.get('/stats', async (req, reply) => {
    return reply.send({
      success: true,
      data: { totalReferrals: 0, totalEarnings: 0, thisMonth: 0 },
    });
  });

  app.post('/apply', async (req, reply) => {
    return reply.send({ success: true, message: 'Referral code applied' });
  });
};

export default referralsRoutes;
