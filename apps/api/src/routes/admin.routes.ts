/**
 * Admin routes — protected
 */
import { FastifyPluginAsync } from 'fastify';

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', app.requireAdmin);

  app.get('/users', async (req, reply) => {
    return reply.send({ success: true, data: [] });
  });

  app.post('/users/:id/ban', async (req, reply) => {
    return reply.send({ success: true, message: 'User banned' });
  });

  app.get('/stats', async (req, reply) => {
    return reply.send({
      success: true,
      data: {
        users: 0,
        startups: 0,
        posts: 0,
        chats: 0,
        activeNow: 0,
      },
    });
  });
};

export default adminRoutes;
