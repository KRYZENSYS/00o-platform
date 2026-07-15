/**
 * Upload routes — S3/Cloudinary
 */
import { FastifyPluginAsync } from 'fastify';

const uploadRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/avatar',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      return reply.send({ success: true, data: { url: 'https://cdn.00o.uz/demo.jpg' } });
    },
  );

  app.post(
    '/post-image',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      return reply.send({ success: true, data: { url: 'https://cdn.00o.uz/demo.jpg' } });
    },
  );
};

export default uploadRoutes;
