'use client';
import { useState } from 'react';
import { Camera, LogOut, Settings, Globe, Bell, Shield, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: user?.displayName || '', bio: '', location: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.updateMe(form);
      updateUser(res.data);
      setEditing(false);
      toast.success('Saqlandi');
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  };

  const onLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col items-center text-center md:flex-row md:items-start md:gap-6 md:text-left">
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.displayName || user?.username || '?'} size="xl" />
            <button className="absolute bottom-0 right-0 rounded-full bg-brand-500 p-2 text-white shadow-glow"><Camera className="h-3.5 w-3.5" /></button>
          </div>
          <div className="mt-4 flex-1 md:mt-0">
            {editing ? (
              <Input placeholder="Ism" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="mb-2" />
            ) : (
              <h1 className="text-2xl font-bold">{user?.displayName || user?.username}</h1>
            )}
            <p className="text-text-muted">@{user?.username}</p>
            {editing ? (
              <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-2 w-full rounded-xl border border-border bg-surface-2 p-2 text-sm" rows={2} />
            ) : (
              <p className="mt-2 text-sm text-text-muted">{form.bio || 'Bio qo\'shilmagan'}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {editing ? (
                <><Button onClick={save} loading={saving}>Saqlash</Button><Button variant="ghost" onClick={() => setEditing(false)}>Bekor</Button></>
              ) : (
                <Button onClick={() => setEditing(true)}><Edit className="h-4 w-4" /> Tahrirlash</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center"><p className="text-2xl font-bold">0</p><p className="text-xs text-text-muted">Postlar</p></Card>
        <Card className="text-center"><p className="text-2xl font-bold">0</p><p className="text-xs text-text-muted">Followers</p></Card>
        <Card className="text-center"><p className="text-2xl font-bold">0</p><p className="text-xs text-text-muted">Following</p></Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">Sozlamalar</h2>
        <div className="space-y-1">
          <SettingItem icon={Globe} label="Til" value="O'zbek" />
          <SettingItem icon={Bell} label="Bildirishnomalar" value="Yoqilgan" />
          <SettingItem icon={Shield} label="Xavfsizlik" value="2FA yoqilmagan" />
          <SettingItem icon={Settings} label="Maxfiylik" value="Ommaviy" />
        </div>
      </Card>

      <Button variant="destructive" className="w-full" onClick={onLogout}><LogOut className="h-4 w-4" /> Chiqish</Button>
    </div>
  );
}

function SettingItem({ icon: Icon, label, value }: any) {
  return (
    <button className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-surface-2">
      <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-text-muted" /><span className="text-sm">{label}</span></div>
      <span className="text-sm text-text-muted">{value}</span>
    </button>
  );
}
