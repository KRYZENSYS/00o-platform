// 00o.uz - Habit routes
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@00o/database';
import { pagination, response } from '@00o/utils';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().default('✅'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#8b5cf6'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']).default('DAILY'),
  targetDays: z.array(z.number().min(0).max(6)).default([0,1,2,3,4,5,6]),
  targetCount: z.number().min(1).default(1),
  unit: z.string().optional(),
});

export const habitRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const habits = await prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: { logs: { where: { userId }, take: 30, orderBy: { date: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = habits.map(h => {
      const dates = new Set(h.logs.map(l => l.date.toISOString().split('T')[0]));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (dates.has(d.toISOString().split('T')[0])) streak++;
        else if (i > 0) break;
      }
      return { ...h, streak, totalLogs: h.logs.length, lastLog: h.logs[0] };
    });

    return response.ok(enriched);
  });

  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const data = createSchema.parse(req.body);
    const habit = await prisma.habit.create({ data: { ...data, userId } });
    await prisma.xpLog.create({ data: { userId, amount: 15, reason: 'Yangi odat', source: 'habit' } });
    return reply.code(201).send(response.ok(habit));
  });

  app.post('/:id/log', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const id = (req.params as any).id;
    const { count = 1, note, date } = req.body as { count?: number; note?: string; date?: string };
    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) return reply.code(404).send({ error: 'NotFound' });
    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: id, date: new Date(date || new Date()) } },
      create: { habitId: id, userId, date: new Date(date || new Date()), count, note },
      update: { count: { increment: count }, note },
    });
    await prisma.xpLog.create({ data: { userId, amount: 5 * count, reason: 'Odat bajarildi', source: 'habit' } });
    return response.ok(log);
  });

  app.delete('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    await prisma.habit.updateMany({ where: { id: (req.params as any).id, userId }, data: { isArchived: true } });
    return response.ok({ deleted: true });
  });
};
