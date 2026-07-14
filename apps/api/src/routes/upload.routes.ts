// 00o.uz - File upload routes (R2/S3)
import { FastifyPluginAsync } from 'fastify';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { prisma } from '@00o/database';
import { response } from '@00o/utils';

const r2 = process.env.R2_ACCOUNT_ID ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
}) : null;

const ALLOWED = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  doc: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  // Upload file
  app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
    const file = await req.file();
    if (!file) return reply.code(400).send({ error: 'NoFile' });

    const userId = (req as any).user.userId;
    const buffer = await file.toBuffer();

    // Validate
    let type: 'image' | 'video' | 'audio' | 'doc' | null = null;
    for (const [k, types] of Object.entries(ALLOWED)) {
      if (types.includes(file.mimetype)) { type = k as any; break; }
    }
    if (!type) return reply.code(400).send({ error: 'InvalidType' });

    if (buffer.length > 50 * 1024 * 1024) return reply.code(413).send({ error: 'FileTooLarge' });

    const ext = file.filename.split('.').pop() || 'bin';
    const filename = `${userId}/${Date.now()}-${nanoid(8)}.${ext}`;

    let url: string;
    if (r2 && process.env.R2_BUCKET) {
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: file.mimetype,
      }));
      url = `${process.env.R2_PUBLIC_URL}/${filename}`;
    } else {
      // Dev: store as base64 (not recommended for prod)
      url = `data:${file.mimetype};base64,${buffer.toString('base64').slice(0, 100)}`;
    }

    const media = await prisma.media.create({
      data: {
        userId, filename, originalName: file.filename,
        mimeType: file.mimetype, size: buffer.length, url,
        metadata: { type },
      },
    });

    return reply.code(201).send(response.ok(media));
  });

  // Delete
  app.delete('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    await prisma.media.deleteMany({
      where: { id: (req.params as any).id, userId: (req as any).user.userId },
    });
    return response.ok({ deleted: true });
  });
};
