'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success('Xush kelibsiz!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login xato');
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
          <h1 className="text-2xl font-bold">{t('welcomeBack')}</h1>
          <p className="mt-2 text-sm text-text-muted">Akkauntingizga kiring</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input
              type="email" placeholder="Email" leftIcon={<Mail className="h-4 w-4" />}
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            />
            <Input
              type="password" placeholder={t('password')} leftIcon={<Lock className="h-4 w-4" />}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
            />
            <Link href="/forgot-password" className="block text-right text-sm text-brand-500 hover:underline">
              {t('forgotPassword')}
            </Link>
            <Button type="submit" size="lg" className="w-full" loading={isLoading}>
              {t('login')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            {t('noAccount')} <Link href="/register" className="font-semibold text-brand-500 hover:underline">{t('register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
