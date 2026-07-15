'use client';
import { useState } from 'react';
import { QrCode, Download, Copy, Share2, Type, Wifi, User, Phone, Mail, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TYPES = [
  { id: 'text', label: 'Matn', icon: Type },
  { id: 'url', label: 'Havola', icon: LinkIcon },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'contact', label: 'Kontakt', icon: User },
];

export default function QrPage() {
  const [type, setType] = useState('text');
  const [text, setText] = useState('00o.uz platformasiga xush kelibsiz!');
  const [ssid, setSsid] = useState('MyWiFi');
  const [password, setPassword] = useState('password123');
  const [security, setSecurity] = useState('WPA');
  const [name, setName] = useState('Aziz Karimov');
  const [phone, setPhone] = useState('+998901234567');
  const [email, setEmail] = useState('aziz@example.com');

  const qrData = () => {
    if (type === 'text') return text;
    if (type === 'url') return text.startsWith('http') ? text : `https://${text}`;
    if (type === 'wifi') return `WIFI:T:${security};S:${ssid};P:${password};;`;
    if (type === 'contact') return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    return text;
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData())}`;

  const download = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'qr-code.png';
    link.click();
    toast.success('QR yuklandi');
  };

  const copy = () => {
    navigator.clipboard.writeText(qrData());
    toast.success('Nusxalandi');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QR Kod Yaratuvchi</h1>
        <p className="mt-1 text-text-muted">Matn, havola, WiFi, kontakt uchun QR</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-4 grid grid-cols-4 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn('flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition-all', type === t.id ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}
              >
                <t.icon className="h-5 w-5" /> {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {type === 'text' && <Input label="Matn" value={text} onChange={(e) => setText(e.target.value)} />}
            {type === 'url' && <Input label="Havola" placeholder="https://example.com" value={text} onChange={(e) => setText(e.target.value)} />}
            {type === 'wifi' && (
              <>
                <Input label="WiFi nomi (SSID)" value={ssid} onChange={(e) => setSsid(e.target.value)} />
                <Input label="Parol" value={password} onChange={(e) => setPassword(e.target.value)} />
                <select value={security} onChange={(e) => setSecurity(e.target.value)} className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm">
                  <option>WPA</option><option>WEP</option><option>nopass</option>
                </select>
              </>
            )}
            {type === 'contact' && (
              <>
                <Input label="Ism" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </>
            )}
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-white p-6">
            <img src={qrUrl} alt="QR" className="h-full w-full" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={copy}><Copy className="h-4 w-4" /> Nusxa</Button>
            <Button variant="outline" onClick={download}><Download className="h-4 w-4" /> Yuklash</Button>
            <Button variant="outline" onClick={() => navigator.share?.({ url: qrUrl })}><Share2 className="h-4 w-4" /> Ulashish</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
