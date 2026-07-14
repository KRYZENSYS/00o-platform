// 00o.uz - Chat routes (with WebSocket)
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@00o/database';
import { response, pagination } from '@00o/utils';

const messageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LOCATION', 'STICKER', 'GIF']).default('TEXT'),
  mediaId: z.string().optional(),
});

export const chatRoutes: FastifyPluginAsync = async (app) => {
  // Get conversations
  app.get('/conversations', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { select: { id: true, username: true, displayName: true, avatar: true } },
        user2: { select: { id: true, username: true, displayName: true, avatar: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    });

    const enriched = conversations.map(c => {
      const other = c.user1Id === userId ? c.user2 : c.user1;
      const unread = c.user1Id === userId ? c.unreadCount1 : c.unreadCount2;
      return { id: c.id, other, lastMessage: c.messages[0], unread, lastMessageAt: c.lastMessageAt };
    });

    return response.ok(enriched);
  });

  // Get messages with user
  app.get('/with/:userId', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const otherId = (req.params as any).userId;
    const { page, limit, skip, take } = pagination((req.query as any).page, (req.query as any).limit, 50);

    const [u1, u2] = [userId, otherId].sort();
    const conv = await prisma.conversation.findUnique({ where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } } });
    if (!conv) return response.paginated([], 0, page, limit);

    // Mark as read
    await prisma.conversation.update({
      where: { id: conv.id },
      data: userId === conv.user1Id ? { unreadCount1: 0 } : { unreadCount2: 0 },
    });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: conv.id },
        skip, take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.message.count({ where: { conversationId: conv.id } }),
    ]);

    return response.paginated(messages.reverse(), total, page, limit);
  });

  // Send message
  app.post('/send', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const data = messageSchema.parse(req.body);

    if (data.receiverId === userId) return reply.code(400).send({ error: 'SelfMessage' });

    const [u1, u2] = [userId, data.receiverId].sort();
    const conv = await prisma.conversation.upsert({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
      create: { user1Id: u1, user2Id: u2 },
      update: { lastMessageAt: new Date() },
    });

    const message = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: userId,
        receiverId: data.receiverId,
        content: data.content,
        type: data.type,
        mediaId: data.mediaId,
      },
    });

    // Increment unread
    await prisma.conversation.update({
      where: { id: conv.id },
      data: data.receiverId === conv.user1Id ? { unreadCount1: { increment: 1 } } : { unreadCount2: { increment: 1 } },
    });

    // Notify
    await prisma.notification.create({
      data: {
        userId: data.receiverId, actorId: userId, type: 'MESSAGE',
        title: 'Yangi xabar', body: data.content.slice(0, 100),
        data: { messageId: message.id, conversationId: conv.id },
      },
    });

    return reply.code(201).send(response.ok(message));
  });

  // WebSocket for real-time messaging
  app.get('/ws', { websocket: true, preHandler: [app.authenticate] }, (socket, req) => {
    const userId = (req as any).user.userId;

    socket.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === 'typing') {
          // Broadcast typing indicator
          const target = await prisma.user.findUnique({ where: { id: data.receiverId }, select: { id: true } });
          if (target) {
            // Send to receiver's socket
            app.websocketServer?.clients?.forEach((client: any) => {
              if (client.userId === data.receiverId && client.readyState === 1) {
                client.send(JSON.stringify({ type: 'typing', from: userId }));
              }
            });
          }
        }
        if (data.type === 'read') {
          const [u1, u2] = [userId, data.senderId].sort();
          await prisma.conversation.updateMany({
            where: { user1Id: u1, user2Id: u2 },
            data: userId === u1 ? { unreadCount1: 0 } : { unreadCount2: 0 },
          });
        }
      } catch (err) {
        console.error('WS error:', err);
      }
    });
  });
};
