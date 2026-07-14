// 00o.uz - Note routes
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma, logAudit } from '@00o/database';
import { pagination, response } from '@00o/utils';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()).default([]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#8b5cf6'),
  isPinned: z.boolean().default(false),
});

export const noteRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const { page, limit, skip, take } = pagination((req.query as any).page, (req.query as any).limit);
    const { category, search, archived, pinned } = req.query as any;
    const where: any = { userId };
    if (category) where.category = category;
    if (archived !== undefined) where.isArchived = archived === 'true';
    if (pinned === 'true') where.isPinned = true;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
    const [notes, total] = await Promise.all([
      prisma.note.findMany({ where, skip, take, orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }] }),
      prisma.note.count({ where }),
    ]);
    return response.paginated(notes, total, page, limit);
  });

  app.get('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const note = await prisma.note.findFirst({ where: { id: (req.params as any).id, userId: (req as any).user.userId } });
    if (!note) return reply.code(404).send({ error: 'NotFound' });
    return response.ok(note);
  });

  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const data = createSchema.parse(req.body);
    const note = await prisma.note.create({ data: { ...data, userId } });
    await prisma.xpLog.create({ data: { userId, amount: 3, reason: 'Note yaratildi', source: 'note' } });
    return reply.code(201).send(response.ok(note));
  });

  app.patch('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const data = createSchema.partial().parse(req.body);
    const note = await prisma.note.update({ where: { id: (req.params as any).id }, data });
    return response.ok(note);
  });

  app.delete('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    await prisma.note.deleteMany({ where: { id: (req.params as any).id, userId: (req as any).user.userId } });
    return response.ok({ deleted: true });
  });
};
