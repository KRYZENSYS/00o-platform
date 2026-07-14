// 00o.uz - Auth routes
import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { prisma, logAudit } from '@00o/database';
import { redis } from '../server';
import { sendEmail } from '../services/email.service';
import { sendSMS } from '../services/sms.service';

const registerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+998\d{9}$/).optional(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100).regex(/^(?=.*[A-Za-z])(?=.*\d)/),
  displayName: z.string().min(2).max(50).optional(),
}).refine(d => d.email || d.phone, { message: 'Email yoki telefon kerak' });

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1),
  twoFACode: z.string().length(6).optional(),
}).refine(d => d.email || d.phone || d.username, { message: 'Email, telefon yoki username kerak' });

export const authRoutes: FastifyPluginAsync = async (app) => {
  // ===== REGISTER =====
  app.post('/register', {
    schema: {
      body: registerSchema,
      tags: ['auth'],
      summary: 'Yangi foydalanuvchi ro\'yxatdan o\'tkazish',
    },
  }, async (req, reply) => {
    const data = req.body as z.infer<typeof registerSchema>;
    const ip = req.ip;
    const ua = req.headers['user-agent'] || '';

    // Rate limit registration
    const attempts = await redis.incr(`register:${ip}`);
    if (attempts > 5) return reply.code(429).send({ error: 'TooManyRequests', message: 'Juda ko\'p urinishlar' });
    await redis.expire(`register:${ip}`, 3600);

    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }, { username: data.username }] },
    });
    if (existing) return reply.code(409).send({ error: 'UserExists', message: 'Bu ma\'lumot allaqachon band' });

    // Hash password
    const hashed = await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        username: data.username,
        password: hashed,
        displayName: data.displayName || data.username,
        profile: { create: { country: 'UZ' } },
      },
      select: { id: true, email: true, phone: true, username: true, displayName: true, role: true, createdAt: true },
    });

    // Send verifications
    if (data.email) {
      const token = nanoid(32);
      await prisma.emailVerification.create({
        data: { userId: user.id, email: data.email!, token, expiresAt: new Date(Date.now() + 24 * 3600 * 1000) },
      });
      sendEmail(data.email, 'verify', { token, name: user.displayName! }).catch(() => {});
    }
    if (data.phone) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.phoneVerification.create({
        data: { userId: user.id, phone: data.phone!, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      });
      sendSMS(data.phone, `00o.uz tasdiqlash kodi: ${code}`).catch(() => {});
    }

    // Generate tokens
    const tokens = await generateTokens(user.id, ip, ua);

    await logAudit(user.id, 'user.register', 'User', user.id, { ip, ua });
    return reply.code(201).send({ user, ...tokens });
  });

  // ===== LOGIN =====
  app.post('/login', {
    schema: {
      body: loginSchema,
      tags: ['auth'],
      summary: 'Tizimga kirish',
    },
  }, async (req, reply) => {
    const data = req.body as z.infer<typeof loginSchema>;
    const ip = req.ip;
    const ua = req.headers['user-agent'] || '';

    // Find user
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }, { username: data.username }] },
    });

    await prisma.loginAttempt.create({
      data: { userId: user?.id, email: data.email, phone: data.phone, ip, userAgent: ua, success: false, reason: user ? 'pending' : 'no_user' },
    });

    if (!user || !user.password) {
      return reply.code(401).send({ error: 'InvalidCredentials', message: 'Login yoki parol noto\'g\'ri' });
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return reply.code(403).send({ error: 'AccountDisabled', message: 'Akkaunt bloklangan' });
    }

    // Check password
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return reply.code(401).send({ error: 'InvalidCredentials', message: 'Login yoki parol noto\'g\'ri' });
    }

    // 2FA check
    if (user.twoFAEnabled) {
      if (!data.twoFACode) {
        return reply.code(200).send({ require2FA: true });
      }
      const verified = speakeasy.totp.verify({ secret: user.twoFASecret!, encoding: 'base32', token: data.twoFACode, window: 1 });
      if (!verified) return reply.code(401).send({ error: 'Invalid2FA', message: '2FA kod noto\'g\'ri' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    // Generate tokens
    const tokens = await generateTokens(user.id, ip, ua);

    await prisma.loginAttempt.create({
      data: { userId: user.id, ip, userAgent: ua, success: true },
    });
    await logAudit(user.id, 'user.login', 'User', user.id, { ip, ua });

    const { password, twoFASecret, ...safeUser } = user;
    return reply.send({ user: safeUser, ...tokens });
  });

  // ===== REFRESH TOKEN =====
  app.post('/refresh', async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) return reply.code(400).send({ error: 'MissingToken' });

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return reply.code(401).send({ error: 'InvalidToken' });
    }

    // Rotate token
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await generateTokens(stored.userId, req.ip, req.headers['user-agent'] || '');
    return reply.send(tokens);
  });

  // ===== LOGOUT =====
  app.post('/logout', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId: (req as any).user.userId },
        data: { revokedAt: new Date() },
      });
    }
    return reply.send({ success: true });
  });

  // ===== VERIFY EMAIL =====
  app.post('/verify-email', async (req, reply) => {
    const { token } = req.body as { token: string };
    const verif = await prisma.emailVerification.findUnique({ where: { token } });
    if (!verif || verif.verifiedAt || verif.expiresAt < new Date()) {
      return reply.code(400).send({ error: 'InvalidToken' });
    }
    await prisma.$transaction([
      prisma.emailVerification.update({ where: { id: verif.id }, data: { verifiedAt: new Date() } }),
      prisma.user.update({ where: { id: verif.userId }, data: { emailVerified: true } }),
    ]);
    return reply.send({ success: true });
  });

  // ===== VERIFY PHONE =====
  app.post('/verify-phone', async (req, reply) => {
    const { phone, code } = req.body as { phone: string; code: string };
    const verif = await prisma.phoneVerification.findFirst({
      where: { phone, code, verifiedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!verif) return reply.code(400).send({ error: 'InvalidCode' });
    if (verif.attempts >= 5) return reply.code(429).send({ error: 'TooManyAttempts' });
    await prisma.$transaction([
      prisma.phoneVerification.update({ where: { id: verif.id }, data: { verifiedAt: new Date() } }),
      prisma.phoneVerification.update({ where: { id: verif.id }, data: { attempts: { increment: 1 } } }),
      prisma.user.update({ where: { id: verif.userId }, data: { phoneVerified: true } }),
    ]);
    return reply.send({ success: true });
  });

  // ===== FORGOT PASSWORD =====
  app.post('/forgot-password', async (req, reply) => {
    const { email } = req.body as { email: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.send({ success: true }); // Don't leak

    const token = nanoid(32);
    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 3600 * 1000) },
    });
    sendEmail(email, 'reset', { token, name: user.displayName! }).catch(() => {});
    return reply.send({ success: true });
  });

  // ===== RESET PASSWORD =====
  app.post('/reset-password', async (req, reply) => {
    const { token, password } = req.body as { token: string; password: string };
    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return reply.code(400).send({ error: 'InvalidToken' });
    }
    if (password.length < 8) return reply.code(400).send({ error: 'WeakPassword' });

    const hashed = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } }),
      prisma.refreshToken.updateMany({ where: { userId: reset.userId }, data: { revokedAt: new Date() } }),
    ]);
    return reply.send({ success: true });
  });

  // ===== 2FA SETUP =====
  app.post('/2fa/setup', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req as any).user.userId;
    const secret = speakeasy.generateSecret({ name: '00o.uz' });
    await prisma.user.update({
      where: { id: userId },
      data: { twoFASecret: secret.base32 },
    });
    const qr = await qrcode.toDataURL(secret.otpauth_url!);
    return reply.send({ secret: secret.base32, qr });
  });

  app.post('/2fa/enable', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { code } = req.body as { code: string };
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFASecret) return reply.code(400).send({ error: 'NoSecret' });

    const verified = speakeasy.totp.verify({ secret: user.twoFASecret, encoding: 'base32', token: code, window: 1 });
    if (!verified) return reply.code(400).send({ error: 'InvalidCode' });

    await prisma.user.update({ where: { id: userId }, data: { twoFAEnabled: true } });
    return reply.send({ success: true });
  });

  app.post('/2fa/disable', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { code } = req.body as { code: string };
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFASecret || !user.twoFAEnabled) return reply.code(400).send({ error: 'NotEnabled' });

    const verified = speakeasy.totp.verify({ secret: user.twoFASecret, encoding: 'base32', token: code, window: 1 });
    if (!verified) return reply.code(400).send({ error: 'InvalidCode' });

    await prisma.user.update({
      where: { id: userId },
      data: { twoFAEnabled: false, twoFASecret: null },
    });
    return reply.send({ success: true });
  });
};

// ===== Helper =====
async function generateTokens(userId: string, ip: string, ua: string) {
  const accessToken = (await import('jsonwebtoken')).default.sign(
    { userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = nanoid(48);
  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      ip,
      device: ua.slice(0, 100),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  // Create session
  await prisma.session.create({
    data: {
      userId,
      ip,
      userAgent: ua,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  return { accessToken, refreshToken, expiresIn: 900 };
}
