// 00o.uz - Database seed
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@00o.uz' },
    update: {},
    create: {
      email: 'admin@00o.uz',
      username: 'admin',
      displayName: 'Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: '00o.uz',
          country: 'UZ',
          city: 'Tashkent',
        },
      },
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Achievements
  const achievements = [
    { code: 'FIRST_LOGIN', name: 'Birinchi qadam', description: 'Platformaga birinchi marta kirdingiz', icon: '🎉', category: 'onboarding', points: 10, rarity: 'COMMON' },
    { code: 'TODO_MASTER', name: 'Vazifa ustasi', description: '100 ta vazifani bajaring', icon: '✅', category: 'productivity', points: 50, rarity: 'UNCOMMON' },
    { code: 'WEEK_STREAK', name: '7 kunlik streak', description: '7 kun ketma-ket faol bo\'ling', icon: '🔥', category: 'engagement', points: 30, rarity: 'UNCOMMON' },
    { code: 'HABIT_BUILDER', name: 'Odat quruvchi', description: '30 kunlik odat yarating', icon: '💪', category: 'health', points: 100, rarity: 'RARE' },
    { code: 'SOCIAL_BUTTERFLY', name: 'Ijtimoiy kelebek', description: '100 ta do\'st orttiring', icon: '🦋', category: 'social', points: 75, rarity: 'RARE' },
    { code: 'PRO_USER', name: 'Pro foydalanuvchi', description: 'Pro tarifga obuna bo\'ling', icon: '💎', category: 'premium', points: 200, rarity: 'EPIC' },
    { code: 'EARLY_BIRD', name: 'Erta turuvchi', description: 'Birinchi 1000 foydalanuvchidan biri bo\'ling', icon: '🐦', category: 'special', points: 500, rarity: 'LEGENDARY' },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: {},
      create: a,
    });
  }
  console.log('✅ Achievements:', achievements.length);

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
