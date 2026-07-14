// 00o.uz - Post routes (Social)
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@00o/database';
import { pagination, response } from '@00o/utils';

const createSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'POLL', 'QUESTION', 'ACHIEVEMENT']).default('TEXT'),
  visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE', 'FRIENDS']).default('PUBLIC'),
  mediaIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
  location: z.string().optional(),
});

export const postRoutes: FastifyPluginAsync = async (app) => {
  // Feed (public + following)
  app.get('/feed', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const { page, limit, skip, take } = pagination((req.query as any).page, (req.query as any).limit);

    // Get following list
    const following = await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
    const followingIds = following.map(f => f.followingId);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          OR: [
            { visibility: 'PUBLIC' },
            { userId: { in: followingIds }, visibility: { in: ['PUBLIC', 'FOLLOWERS'] } },
            { userId, visibility: 'PRIVATE' },
          ],
        },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take,
      }),
      prisma.post.count(),
    ]);

    return response.paginated(posts, total, page, limit);
  });

  // User's posts
  app.get('/user/:username', async (req, reply) => {
    const { username } = req.params as { username: string };
    const { page, limit, skip, take } = pagination((req.query as any).page, (req.query as any).limit);
    const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!user) return reply.code(404).send({ error: 'NotFound' });

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: user.id, visibility: 'PUBLIC' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take,
      }),
      prisma.post.count({ where: { userId: user.id, visibility: 'PUBLIC' } }),
    ]);

    return response.paginated(posts, total, page, limit);
  });

  // Create post
  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const data = createSchema.parse(req.body);
    const post = await prisma.post.create({
      data: { ...data, userId },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });
    await prisma.xpLog.create({ data: { userId, amount: 10, reason: 'Post yaratildi', source: 'post' } });

    // Notify mentioned users
    if (data.mentions?.length) {
      await prisma.notification.createMany({
        data: data.mentions.map(username => ({
          userId: '', // TODO: lookup by username
          actorId: userId,
          type: 'MENTION' as const,
          title: 'Sizni eslab o\'tishdi',
          body: `${data.content.slice(0, 100)}`,
          data: { postId: post.id },
        })),
      });
    }

    return reply.code(201).send(response.ok(post));
  });

  // Get single post
  app.get('/:id', async (req, reply) => {
    const post = await prisma.post.findUnique({
      where: { id: (req.params as any).id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!post) return reply.code(404).send({ error: 'NotFound' });

    // Increment views
    await prisma.post.update({ where: { id: post.id }, data: { viewsCount: { increment: 1 } } });

    return response.ok(post);
  });

  // Like / Unlike
  app.post('/:id/like', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const id = (req.params as any).id;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return reply.code(404).send({ error: 'NotFound' });

    const existing = await prisma.like.findUnique({
      where: { postId_userId_type: { postId: id, userId, type: 'LIKE' } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.post.update({ where: { id }, data: { likesCount: { decrement: 1 } } }),
      ]);
      return response.ok({ liked: false });
    }

    await prisma.$transaction([
      prisma.like.create({ data: { postId: id, userId, type: 'LIKE' } }),
      prisma.post.update({ where: { id }, data: { likesCount: { increment: 1 } } }),
    ]);

    if (post.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId, actorId: userId, type: 'LIKE',
          title: 'Postingizga layk bosishdi', data: { postId: id },
        },
      });
    }

    return response.ok({ liked: true });
  });

  // Comment
  app.post('/:id/comment', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const id = (req.params as any).id;
    const { content, parentId } = req.body as { content: string; parentId?: string };

    if (content.length < 1 || content.length > 1000) return reply.code(400).send({ error: 'InvalidContent' });

    const comment = await prisma.comment.create({
      data: { postId: id, userId, content, parentId },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
    });

    await prisma.post.update({ where: { id }, data: { commentsCount: { increment: 1 } } });

    return reply.code(201).send(response.ok(comment));
  });

  // Delete
  app.delete('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    await prisma.post.deleteMany({ where: { id: (req.params as any).id, userId } });
    return response.ok({ deleted: true });
  });
};
