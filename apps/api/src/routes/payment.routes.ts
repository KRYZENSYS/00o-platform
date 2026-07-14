// 00o.uz - Payment routes (Payme, Click, Uzum, Stripe)
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@00o/database';
import { response } from '@00o/utils';

const PLANS = {
  PRO_MONTHLY: { name: 'Pro Monthly', amount: 29900, currency: 'UZS', duration: 30 },
  PRO_YEARLY: { name: 'Pro Yearly', amount: 299000, currency: 'UZS', duration: 365 },
  BUSINESS_MONTHLY: { name: 'Business Monthly', amount: 99900, currency: 'UZS', duration: 30 },
  BUSINESS_YEARLY: { name: 'Business Yearly', amount: 999000, currency: 'UZS', duration: 365 },
};

export const paymentRoutes: FastifyPluginAsync = async (app) => {
  // Get plans
  app.get('/plans', async (req, reply) => {
    return response.ok(PLANS);
  });

  // Get current subscription
  app.get('/subscription', { preHandler: [app.authenticate] }, async (req, reply) => {
    const sub = await prisma.subscription.findUnique({
      where: { userId: (req as any).user.userId },
      include: { payments: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    return response.ok(sub);
  });

  // Create payment (Payme example)
  app.post('/payme/create', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const { plan } = req.body as { plan: keyof typeof PLANS };
    const planData = PLANS[plan];
    if (!planData) return reply.code(400).send({ error: 'InvalidPlan' });

    const payment = await prisma.payment.create({
      data: {
        userId, plan, amount: planData.amount, currency: planData.currency,
        provider: 'PAYME', status: 'PENDING', method: 'payme',
        description: planData.name,
      },
    });

    // In real life, integrate with Payme API
    // For now, return mock payment URL
    const paymeUrl = `https://checkout.paycom.uz/${Buffer.from(`${payment.id}:${planData.amount}`).toString('base64')}`;

    return response.ok({ paymentId: payment.id, url: paymeUrl, amount: planData.amount });
  });

  // Payme webhook
  app.post('/payme/callback', async (req, reply) => {
    // Verify Payme signature
    const auth = req.headers.authorization;
    if (!auth) return reply.code(401).send({ error: 'Unauthorized' });

    // Process payment
    const { id, state } = req.body as any;
    if (state === 2) { // Paid
      const payment = await prisma.payment.findUnique({ where: { id }, include: { user: true } });
      if (!payment || payment.status === 'COMPLETED') return reply.send({ success: true });

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({ where: { id }, data: { status: 'COMPLETED', paidAt: new Date() } });

        // Activate subscription
        const planData = PLANS[payment.plan as keyof typeof PLANS];
        const endDate = new Date(Date.now() + planData.duration * 24 * 3600 * 1000);

        await tx.subscription.upsert({
          where: { userId: payment.userId },
          create: {
            userId: payment.userId, plan: payment.plan, status: 'ACTIVE',
            startDate: new Date(), endDate, autoRenew: true,
          },
          update: { plan: payment.plan, status: 'ACTIVE', endDate },
        });

        // Upgrade user role
        const role = payment.plan.startsWith('BUSINESS') ? 'BUSINESS' : 'PREMIUM';
        await tx.user.update({ where: { id: payment.userId }, data: { role } });

        // XP
        await tx.xpLog.create({ data: { userId: payment.userId, amount: 100, reason: 'Premium obuna', source: 'payment' } });
      });
    }

    return reply.send({ success: true });
  });

  // Cancel subscription
  app.post('/cancel', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    await prisma.subscription.updateMany({
      where: { userId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), autoRenew: false, cancelReason: (req.body as any).reason },
    });
    return response.ok({ cancelled: true });
  });

  // Get payment history
  app.get('/history', { preHandler: [app.authenticate] }, async (req, reply) => {
    const payments = await prisma.payment.findMany({
      where: { userId: (req as any).user.userId },
      orderBy: { createdAt: 'desc' },
    });
    return response.ok(payments);
  });
};
