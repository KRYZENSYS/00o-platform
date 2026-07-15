import { z } from 'zod';

export const emailSchema = z.string().email('Noto\'g\'ri email');
export const phoneSchema = z.string().regex(/^\+998\d{9}$/, 'Noto\'g\'ri telefon (+998XXXXXXXXX)');
export const passwordSchema = z
  .string()
  .min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak')
  .regex(/[A-Z]/, 'Parol kamida bitta katta harf bo\'lishi kerak')
  .regex(/[0-9]/, 'Parol kamida bitta raqam bo\'lishi kerak');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2).max(100),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Faqat harflar, raqamlar va _'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
