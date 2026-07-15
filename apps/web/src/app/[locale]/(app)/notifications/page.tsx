'use client';
import { Bell, Heart, MessageCircle, User, Trophy, DollarSign, Settings as SettingsIcon, Check, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, timeAgo } from '@/lib/utils';

const NOTIFS = [
  { id: '1', type: 'like', icon: Heart, color: 'text-red-500 bg-red-500/10', user: 'Aziz Karimov', action: 'postingizga like bosdi', time: '5 daqiqa oldin', read: false },
  { id: '2', type: 'comment', icon: MessageCircle, color: 'text-blue-500 bg-blue-500/10', user: 'Malika Yusupova', action: 'kommentariya yozdi', time: '15 daqiqa oldin', read: false },
  { id: '3', type: 'follow', icon: User, color: 'text-purple-500 bg-purple-500/10', user: 'Bobur Ergashev', action: 'sizni follow qildi', time: '1 soat oldin', read: false },
  { id: '4', type: 'achievement', icon: Trophy, color: 'text-amber-500 bg-amber-500/10', user: 'Tizim', action: '"7 kunlik streak" yutug\'ini oldingiz!', time: '3 soat oldin', read: true },
  { id: '5', type: 'payment', icon: DollarSign, color: 'text-green-500 bg-green-500/10', user: 'Premium', action: 'to\'lov muvaffaqiyatli amalga oshirildi', time: 'Kecha', read: true },
  { id: '6', type: 'like', icon: Heart, color: 'text-red-500 bg-red-500/10', user: 'Nilufar Saidova', action: 'va 23 kishi postingizga like bosdi', time: '2 kun oldin', read: true },
  { id: '7', type: 'comment', icon: MessageCircle, color: 'text-blue-500 bg-blue-500/10', user: 'Sherzod', action: 'sizga xabar yubordi', time: '3 kun oldin', read: true },
  { id: '8', type: 'follow', icon: User, color: 'text-purple-500 bg-purple-500/10', user: 'Dilfuza', action: 'sizni follow qildi', time: '1 hafta oldin', read: true },
];

export default function NotificationsPage() {
  const unread = NOTIFS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bildirishnomalar</h1>
          <p className="mt-1 text-sm text-text-muted">{unread} ta yangi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><CheckCheck className="h-4 w-4" /> Hammasini o\'qish</Button>
          <Button variant="outline"><SettingsIcon className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex gap-2">
        {['Hammasi', 'O\'qilmagan', 'Like', 'Komment', 'Follow'].map((f, i) => (
          <button key={f} className={cn('rounded-full border px-4 py-1.5 text-sm transition-all', i === 0 ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {f}
          </button>
        ))}
      </div>

      <Card>
        <div className="divide-y divide-border">
          {NOTIFS.map((n) => (
            <div key={n.id} className={cn('flex items-start gap-3 p-4 transition-colors hover:bg-surface-2', !n.read && 'bg-brand-500/5')}>
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', n.color)}>
                <n.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm"><span className="font-semibold">{n.user}</span> {n.action}</p>
                <p className="mt-0.5 text-xs text-text-muted">{n.time}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
