'use client';
import { useState } from 'react';
import { Delete, Calculator as CalcIcon, History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [waiting, setWaiting] = useState(false);

  const inputDigit = (d: string) => {
    if (waiting) { setDisplay(d); setWaiting(false); }
    else setDisplay(display === '0' ? d : display + d);
  };

  const inputOp = (o: string) => {
    const cur = parseFloat(display);
    if (prev != null && op) {
      const result = calc(prev, cur, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(cur);
    }
    setOp(o);
    setWaiting(true);
  };

  const calc = (a: number, b: number, o: string) => {
    switch (o) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return a / b;
      default: return b;
    }
  };

  const equals = () => {
    if (prev != null && op) {
      const cur = parseFloat(display);
      const result = calc(prev, cur, op);
      setHistory([`${prev} ${op} ${cur} = ${result}`, ...history].slice(0, 10));
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setWaiting(true);
    }
  };

  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); setWaiting(false); };
  const backspace = () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0');

  const scientific = (fn: 'sin' | 'cos' | 'tan' | 'log' | 'ln' | 'sqrt' | 'sqr' | '1/x' | 'abs') => {
    const v = parseFloat(display);
    let result = 0;
    switch (fn) {
      case 'sin': result = Math.sin(v); break;
      case 'cos': result = Math.cos(v); break;
      case 'tan': result = Math.tan(v); break;
      case 'log': result = Math.log10(v); break;
      case 'ln': result = Math.log(v); break;
      case 'sqrt': result = Math.sqrt(v); break;
      case 'sqr': result = v * v; break;
      case '1/x': result = 1 / v; break;
      case 'abs': result = Math.abs(v); break;
    }
    setHistory([`${fn}(${v}) = ${result}`, ...history].slice(0, 10));
    setDisplay(String(result));
    setWaiting(true);
  };

  const BTNS = [
    { label: 'C', onClick: clear, color: 'bg-red-500/20 text-red-500' },
    { label: '⌫', onClick: backspace, color: 'bg-orange-500/20 text-orange-500' },
    { label: '%', onClick: () => setDisplay(String(parseFloat(display) / 100)), color: 'bg-blue-500/20 text-blue-500' },
    { label: '÷', onClick: () => inputOp('÷'), color: 'bg-brand-500/20 text-brand-500' },
    { label: '7', onClick: () => inputDigit('7') },
    { label: '8', onClick: () => inputDigit('8') },
    { label: '9', onClick: () => inputDigit('9') },
    { label: '×', onClick: () => inputOp('×'), color: 'bg-brand-500/20 text-brand-500' },
    { label: '4', onClick: () => inputDigit('4') },
    { label: '5', onClick: () => inputDigit('5') },
    { label: '6', onClick: () => inputDigit('6') },
    { label: '-', onClick: () => inputOp('-'), color: 'bg-brand-500/20 text-brand-500' },
    { label: '1', onClick: () => inputDigit('1') },
    { label: '2', onClick: () => inputDigit('2') },
    { label: '3', onClick: () => inputDigit('3') },
    { label: '+', onClick: () => inputOp('+'), color: 'bg-brand-500/20 text-brand-500' },
    { label: '±', onClick: () => setDisplay(String(-parseFloat(display))) },
    { label: '0', onClick: () => inputDigit('0') },
    { label: '.', onClick: () => !display.includes('.') && setDisplay(display + '.') },
    { label: '=', onClick: equals, color: 'bg-gradient-to-br from-brand-500 to-pink-500 text-white' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Kalkulyator</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {['sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', '1/x'].map((fn) => (
                <button key={fn} onClick={() => scientific(fn.toLowerCase() as any)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs hover:bg-surface-3">{fn}</button>
              ))}
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-right font-mono">
              <p className="text-3xl font-bold text-white">{display}</p>
              {op && <p className="text-sm text-white/60">{prev} {op}</p>}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BTNS.map((b, i) => (
                <button key={i} onClick={b.onClick} className={cn('rounded-2xl py-4 text-lg font-semibold transition-all hover:scale-105 active:scale-95', b.color || 'bg-surface-2 hover:bg-surface-3')}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2 font-semibold"><History className="h-4 w-4" /> Tarix</div>
          <div className="space-y-2">
            {history.length === 0 ? <p className="py-8 text-center text-sm text-text-muted">Tarix bo\'sh</p> :
              history.map((h, i) => (
                <div key={i} className="rounded-xl bg-surface-2 p-2 font-mono text-xs">{h}</div>
              ))
            }
          </div>
        </Card>
      </div>
    </div>
  );
}
