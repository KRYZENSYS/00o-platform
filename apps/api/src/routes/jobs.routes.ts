/**
 * Jobs routes
 */
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  company: z.string().min(2).max(100),
  location: z.string().max(100).optional(),
  remote: z.boolean().default(false),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  currency: z.enum(['UZS', 'USD']).default('UZS'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  skills: z.array(z.string()).max(20).default([]),
});

const jobsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => {
    return reply.send({ success: true, data: [] });
  });

  app.get('/:id', async (req, reply) => {
    return reply.send({ success: true, data: { id: (req.params as any).id } });
  });

  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = createJobSchema.parse(req.body);
    return reply.send({ success: true, data: body });
  });

  app.post('/:id/apply', { preHandler: [app.authenticate] }, async (req, reply) => {
    return reply.send({ success: true, message: 'Application submitted' });
  });
};

export default jobsRoutes;
