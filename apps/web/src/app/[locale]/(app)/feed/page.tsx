'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Heart, MessageCircle, Send, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { timeAgo, cn } from '@/lib/utils';

export default function FeedPage() {
  const { data, mutate } = useSWR('/posts/feed', () => api.getFeed());
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const publish = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try { await api.createPost({ content }); setContent(''); mutate(); toast.success('Nashr etildi'); }
    catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  const like = async (id: string) => {
    try { await api.likePost(id); mutate(); } catch (err: any) { toast.error(err.message); }
  };

  const posts = data?.data || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Lenta</h1>

      <Card>
        <textarea
          placeholder="Bugun nima bilan baham ko'rmoqchisiz?" value={content} onChange={(e) => setContent(e.target.value)}
          className="w-full resize-none border-0 bg-transparent text-sm focus:outline-none" rows={3}
        />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <button className="rounded-lg p-2 text-text-muted hover:bg-surface-2"><ImageIcon className="h-4 w-4" /></button>
          <Button onClick={publish} loading={loading} size="sm"><Send className="h-4 w-4" /> Nashr etish</Button>
        </div>
      </Card>

      {posts.length === 0 ? (
        <Card><p className="py-12 text-center text-text-muted">Hozircha postlar yo'q. Birinchi bo'ling!</p></Card>
      ) : posts.map((p: any) => (
        <Card key={p.id}>
          <div className="flex items-start gap-3">
            <Avatar src={p.user?.avatar} name={p.user?.displayName || p.user?.username} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{p.user?.displayName}</p>
                <p className="text-sm text-text-muted">@{p.user?.username} · {timeAgo(p.createdAt)}</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{p.content}</p>
              <div className="mt-3 flex items-center gap-4 text-text-muted">
                <button onClick={() => like(p.id)} className="flex items-center gap-1 text-xs transition-colors hover:text-red-500">
                  <Heart className={cn('h-4 w-4', p.likesCount > 0 && 'fill-red-500 text-red-500')} /> {p.likesCount || 0}
                </button>
                <button className="flex items-center gap-1 text-xs hover:text-brand-500">
                  <MessageCircle className="h-4 w-4" /> {p.commentsCount || 0}
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
