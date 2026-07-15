'use client';
import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function FeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.feed.list({ limit: 30 });
      setPosts(r.data?.items || r.data || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      const r = await api.feed.create({ content: text });
      setPosts((p) => [r.data, ...p]);
      setText('');
    } catch { /* ignore */ }
    finally { setPosting(false); }
  };

  const like = async (id: string) => {
    setPosts((p) => p.map((x) => x.id === id ? { ...x, liked: !x.liked, likes: (x.likes || 0) + (x.liked ? -1 : 1) } : x));
    try { await api.feed.like(id); } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-black">Feed</h1>

      <Card>
        <form onSubmit={submit}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar src={user?.avatar_url} alt={user?.first_name || 'U'} />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nima yangilik?"
                rows={2}
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <button type="button" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-500">
                <ImageIcon className="h-4 w-4" /> Rasm
              </button>
              <Button type="submit" size="sm" variant="gradient" loading={posting}>
                <Send className="h-3.5 w-3.5" /> Joylash
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-slate-500">Hozircha postlar yo\'q. Birinchi bo\'ling!</CardContent></Card>
      ) : (
        posts.map((p: any) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
              <Avatar src={p.author?.avatar_url} alt={p.author?.first_name || 'U'} />
              <div className="flex-1">
                <div className="text-sm font-bold">{p.author?.first_name} {p.author?.last_name || ''}</div>
                <div className="text-[10px] text-slate-500">{new Date(p.created_at).toLocaleString()}</div>
              </div>
              {p.author?.subscription_plan && p.author.subscription_plan !== 'free' && <Sparkles className="h-4 w-4 text-amber-500" />}
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{p.content}</p>
              {p.image_url && <img src={p.image_url} alt="" className="rounded-xl" />}
              <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-slate-500 dark:border-slate-800">
                <button onClick={() => like(p.id)} className={cn('flex items-center gap-1.5 text-xs transition hover:text-pink-500', p.liked && 'text-pink-500')}>
                  <Heart className={cn('h-4 w-4', p.liked && 'fill-current')} /> {p.likes || 0}
                </button>
                <button className="flex items-center gap-1.5 text-xs transition hover:text-blue-500">
                  <MessageCircle className="h-4 w-4" /> {p.comments_count || 0}
                </button>
                <button className="flex items-center gap-1.5 text-xs transition hover:text-green-500">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
