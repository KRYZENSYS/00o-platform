'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Settings as SettingsIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MODES = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, color: 'from-red-500 to-pink-500', icon: Brain, desc: '25 daqiqa ish, 5 daqiqa tanaffus' },
  { id: 'short', name: 'Qisqa tanaffus', duration: 5 * 60, color: 'from-green-500 to-emerald-500', icon: Coffee, desc: '5 daqiqa dam olish' },
  { id: 'long', name: 'Uzun tanaffus', duration: 15 * 60, color: 'from-blue-500 to-cyan-500', icon: Coffee, desc: '15 daqiqa dam olish' },
  { id: 'custom', name: 'Maxsus', duration: 10 * 60, color: 'from-purple-500 to-violet-500', icon: Zap, desc: 'O\'zingiz vaqt belgilang' },
];

export default function TimerPage() {
  const [mode, setMode] = useState('pomodoro');
  const [time, setTime] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<{ date: string; minutes: number; mode: string }[]>([
    { date: '2026-07-15', minutes: 125, mode: 'pomodoro' },
    { date: '2026-07-14', minutes: 100, mode: 'pomodoro' },
    { date: '2026-07-13', minutes: 150, mode: 'pomodoro' },
  ]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentMode = MODES.find((m) => m.id === mode)!;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime((t) => {
          if (t <= 1) {
            setRunning(false);
            playSound();
            setSessions((s) => [{ date: new Date().toISOString().split('T')[0], minutes: currentMode.duration / 60, mode }, ...s]);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, currentMode.duration, mode]);

  const playSound = () => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audio = new AudioContext();
      const osc = audio.createOscillator();
      osc.frequency.value = 800;
      osc.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + 0.3);
    }
  };

  const reset = () => { setTime(currentMode.duration); setRunning(false); };
  const switchMode = (id: string) => { setMode(id); setTime(MODES.find((m) => m.id === id)!.duration); setRunning(false); };

  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  const progress = ((currentMode.duration - time) / currentMode.duration) * 100;
  const totalToday = sessions.filter((s) => s.date === new Date().toISOString().split('T')[0]).reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pomodoro Timer</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 text-center">
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={cn('flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-all', mode === m.id ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}
              >
                <m.icon className="h-4 w-4" /> {m.name}
              </button>
            ))}
          </div>

          <div className="relative mx-auto h-64 w-64">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-2" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${(2 * Math.PI * 45) * (1 - progress / 100)}`} className="transition-all" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className="text-brand-500" stopColor="currentColor" />
                  <stop offset="100%" className="text-pink-500" stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className={cn('text-6xl font-bold tabular-nums', currentMode.color.replace('from-', 'text-').split(' ')[0])}>{minutes}:{seconds}</p>
              <p className="mt-2 text-sm text-text-muted">{currentMode.desc}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <Button size="lg" onClick={() => setRunning(!running)} className={cn('bg-gradient-to-r', currentMode.color)}>
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {running ? 'Tanaffus' : 'Boshlash'}
            </Button>
            <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="h-5 w-5" /></Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Bugungi statistika</h3>
          <div className="space-y-3">
            <div className="rounded-xl bg-gradient-to-br from-brand-500/10 to-pink-500/10 p-4 text-center">
              <p className="text-3xl font-bold">{totalToday}</p>
              <p className="text-sm text-text-muted">daqiqa</p>
            </div>
            <div className="flex items-center justify-between text-sm"><span>Sessiyalar:</span><span className="font-semibold">{sessions.filter((s) => s.date === new Date().toISOString().split('T')[0]).length}</span></div>
            <div className="flex items-center justify-between text-sm"><span>XP:</span><span className="font-semibold">+{Math.floor(totalToday / 5)}</span></div>
          </div>
          <h3 className="mt-6 mb-3 font-semibold">Yaqin tarix</h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s, i) => (
              <div key={i} className="flex justify-between rounded-xl bg-surface-2 p-2 text-sm">
                <span>{s.date}</span>
                <span className="font-semibold">{s.minutes} daq</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
