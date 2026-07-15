/**
 * Chat routes
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'image', 'file', 'voice']).default('text'),
});

const chatRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    return reply.send({ success: true, data: [] });
  });

  app.get('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    return reply.send({ success: true, data: { id: (req.params as any).id } });
  });

  app.post(
    '/:id/messages',
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const body = sendMessageSchema.parse(req.body);
      return reply.send({ success: true, data: { chatId: (req.params as any).id, ...body } });
    },
  );
};

export default chatRoutes;
