'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({ email: '', phone: '', username: '', password: '', displayName: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        ...form,
        email: form.email || undefined,
        phone: form.phone || undefined,
      });
      toast.success('Akkaunt yaratildi!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Xatolik');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold shadow-glow">∞</div>
          <span className="text-2xl font-bold">00o.uz</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface/80 p-8 shadow-xl backdrop-blur-xl">
          <h1 className="text-2xl font-bold">{t('createAccount')}</h1>
          <p className="mt-2 text-sm text-text-muted">Bepul va tez</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input placeholder={t('username')} leftIcon={<User className="h-4 w-4" />} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
            <Input type="email" placeholder="Email" leftIcon={<Mail className="h-4 w-4" />} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="+998901234567" leftIcon={<Phone className="h-4 w-4" />} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input type="password" placeholder={t('password')} leftIcon={<Lock className="h-4 w-4" />} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            <Button type="submit" size="lg" className="w-full" loading={isLoading}>
              {t('register')}
            </Button>
            <p className="text-center text-xs text-text-muted">Email yoki telefon — biri kerak</p>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            {t('hasAccount')} <Link href="/login" className="font-semibold text-brand-500 hover:underline">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
