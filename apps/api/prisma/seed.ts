/**
 * Prisma seed — initial data
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Admin
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@00o.uz' },
    update: {},
    create: {
      email: 'admin@00o.uz',
      password: adminPassword,
      username: 'admin',
      fullName: 'Administrator',
      role: 'ADMIN',
      isVerified: true,
      tokenBalance: 10000,
    },
  });
  console.log('✅ Admin:', admin.email);

  // Subscription
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      plan: 'BUSINESS',
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenew: true,
    },
  });

  // Sample startup
  const sampleStartup = await prisma.startup.upsert({
    where: { slug: 'demo-startup' },
    update: {},
    create: {
      name: 'Demo Startup',
      slug: 'demo-startup',
      description: 'Demo startup tavsifi',
      industry: 'EdTech',
      stage: 'MVP',
      ownerId: admin.id,
    },
  });
  console.log('✅ Sample startup:', sampleStartup.name);

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
