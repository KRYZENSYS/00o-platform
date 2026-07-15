'use client';
import { useState } from 'react';
import { Droplet, Moon, Smile, Activity, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MOODS = ['😢', '😞', '😐', '🙂', '😄', '😍'];
const MOOD_LABELS = ['Juda yomon', 'Yomon', 'Normal', 'Yaxshi', 'Ajoyib', 'Mukammal'];

export default function HealthPage() {
  const [water, setWater] = useState(4);
  const [sleep, setSleep] = useState(7.5);
  const [mood, setMood] = useState(4);
  const [steps, setSteps] = useState(5430);
  const [adding, setAdding] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const log = () => {
    setLogs([{ id: Date.now(), water, sleep, mood, steps, date: new Date() }, ...logs]);
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sog'liq</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><div className="flex flex-col items-center text-center"><Droplet className="h-8 w-8 text-blue-500" /><p className="mt-2 text-3xl font-bold">{water}</p><p className="text-xs text-text-muted">/ 8 stakan</p><div className="mt-2 flex gap-1"><Button size="sm" variant="ghost" onClick={() => setWater(Math.max(0, water - 1))}>-</Button><Button size="sm" variant="ghost" onClick={() => setWater(water + 1)}>+</Button></div></div></Card>
        <Card><div className="flex flex-col items-center text-center"><Moon className="h-8 w-8 text-indigo-500" /><p className="mt-2 text-3xl font-bold">{sleep}</p><p className="text-xs text-text-muted">soat</p><Input type="number" step="0.5" value={sleep} onChange={(e) => setSleep(+e.target.value)} className="mt-2" /></div></Card>
        <Card><div className="flex flex-col items-center text-center"><Smile className="h-8 w-8 text-yellow-500" /><p className="mt-2 text-4xl">{MOODS[mood]}</p><p className="text-xs text-text-muted">{MOOD_LABELS[mood]}</p><input type="range" min="0" max="5" value={mood} onChange={(e) => setMood(+e.target.value)} className="mt-2 w-full" /></div></Card>
        <Card><div className="flex flex-col items-center text-center"><Activity className="h-8 w-8 text-green-500" /><p className="mt-2 text-3xl font-bold">{steps.toLocaleString()}</p><p className="text-xs text-text-muted">qadam</p><p className="mt-2 text-xs">Maqsad: 10,000</p></div></Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Bugungi ma'lumotlar</h2>
          <Button size="sm" onClick={() => setAdding(true)}><Plus className="h-3.5 w-3.5" /> Saqlash</Button>
        </div>
        {adding && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm">Suv: {water} stakan</label><input type="range" min="0" max="15" value={water} onChange={(e) => setWater(+e.target.value)} className="w-full" /></div>
              <div><label className="text-sm">Uyqu: {sleep} soat</label><input type="range" min="0" max="12" step="0.5" value={sleep} onChange={(e) => setSleep(+e.target.value)} className="w-full" /></div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setAdding(false)}>Bekor</Button>
              <Button onClick={log}>Saqlash</Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Tarix</h2>
        <div className="space-y-2">
          {logs.length === 0 ? <p className="text-sm text-text-muted">Hozircha yozuvlar yo'q</p> : logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-xl bg-surface-2 p-3 text-sm">
              <div className="flex gap-3">
                <span>💧 {l.water}</span><span>😴 {l.sleep}s</span><span>{MOODS[l.mood]}</span><span>👟 {l.steps}</span>
              </div>
              <span className="text-xs text-text-muted">{new Date(l.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
