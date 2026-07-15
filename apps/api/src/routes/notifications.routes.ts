/**
 * Notifications routes
 */
import { FastifyPluginAsync } from 'fastify';

const notificationsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      return reply.send({ success: true, data: [] });
    },
  );

  app.put(
    '/:id/read',
    { preHandler: [app.authenticate] },
    async (req, reply) => reply.send({ success: true }),
  );
};

export default notificationsRoutes;
