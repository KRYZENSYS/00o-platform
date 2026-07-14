// 00o.uz - Email service (Resend)
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  verify: (d) => ({
    subject: '00o.uz - Email tasdiqlash',
    html: `<h2>Salom, ${d.name}!</h2><p>Email manzilingizni tasdiqlash uchun quyidagi havolani bosing:</p><p><a href="${process.env.APP_URL}/verify-email?token=${d.token}" style="background:#8b5cf6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Tasdiqlash</a></p><p>Yoki bu kodni kiriting: <b>${d.token.slice(0, 8)}</b></p>`,
  }),
  reset: (d) => ({
    subject: '00o.uz - Parolni tiklash',
    html: `<h2>Salom, ${d.name}!</h2><p>Parolni tiklash uchun:</p><p><a href="${process.env.APP_URL}/reset-password?token=${d.token}" style="background:#8b5cf6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Yangi parol o'rnatish</a></p><p>Havola 1 soat ichida tugaydi.</p>`,
  }),
  welcome: (d) => ({
    subject: '00o.uz - Xush kelibsiz!',
    html: `<h2>Xush kelibsiz, ${d.name}! 🎉</h2><p>00o.uz oilasiga qo'shilganingiz bilan tabriklaymiz!</p><p>50+ foydali ilovadan foydalaning.</p>`,
  }),
};

export async function sendEmail(to: string, template: string, data: any) {
  const tpl = templates[template]?.(data);
  if (!tpl) throw new Error(`Template not found: ${template}`);

  if (!resend) {
    console.log(`📧 [DEV] To: ${to}, Subject: ${tpl.subject}`);
    return { id: 'dev' };
  }

  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@00o.uz',
    to,
    subject: tpl.subject,
    html: tpl.html,
  });
}
