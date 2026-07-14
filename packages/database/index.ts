// 00o.uz - Database client & utilities
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Helper utilities
export async function findOrCreateUser(email: string, data: any = {}) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, username: email.split('@')[0], ...data },
  });
}

export async function logAudit(userId: string | null, action: string, resource: string, resourceId?: string, metadata?: any) {
  return prisma.auditLog.create({
    data: { userId, action, resource, resourceId, metadata },
  });
}

export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
