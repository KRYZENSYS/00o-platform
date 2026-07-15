'use client';
import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Image, Smile, MapPin, Hash, Send, TrendingUp, Sparkles, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const POSTS = [
  { id: '1', author: { name: 'Aziz Karimov', avatar: 'AK', verified: true, title: 'Startup Founder' }, time: '2 soat', content: 'Yangi startapimiz AI Study Buddy 50K foydalanuvchiga yetdi! 🎉 Barcha jamoaga katta rahmat. Keyingi qadam - Series A.', image: null, likes: 234, comments: 45, shares: 12, liked: true, tags: ['Startup', 'AI', 'EdTech'] },
  { id: '2', author: { name: 'Malika Yusupova', avatar: 'MY', verified: true, title: 'Senior Designer' }, time: '4 soat', content: 'Yangi dizayn tizimini tugatdik! Glassmorphism, gradient va smooth animatsiyalar bilan. #DesignSystem', image: '🎨', likes: 412, comments: 67, shares: 28, liked: false, tags: ['Design', 'UI/UX'] },
  { id: '3', author: { name: 'Bobur Ergashev', avatar: 'BE', verified: false, title: 'Investor' }, time: '6 soat', content: 'Bugun 3 ta yangi startapga investitsiya kiritdik. Umumiy $250K. O\'zbekistonda startup ekotizimi tez rivojlanmoqda!', image: null, likes: 156, comments: 34, shares: 8, liked: true, tags: ['Investment', 'Startup'] },
  { id: '4', author: { name: 'AI Assistant', avatar: '🤖', verified: true, title: 'AI' }, time: '8 soat', content: '💡 Yangi AI tavsiya: Sizning profilingizga ko\'ra 5 ta mos startap mavjud. Batafsil -> /ai/ideas', image: null, likes: 89, comments: 12, shares: 5, liked: false, tags: ['AI', 'Tavsiya'] },
];

const TRENDING = [
  { tag: '#AIStartup', posts: 1234 },
  { tag: '#OzbekIT', posts: 856 },
  { tag: '#Frilanser', posts: 567 },
  { tag: '#Investitsiya', posts: 432 },
  { tag: '#DesignSystem', posts: 298 },
];

const SUGGESTIONS = [
  { name: 'Sardor Aliyev', avatar: 'SA', title: 'Full-stack Dev', mutual: 12 },
  { name: 'Nilufar', avatar: 'N', title: 'Marketing', mutual: 8 },
  { name: 'Jasur', avatar: 'J', title: 'Video Editor', mutual: 5 },
];

export default function FeedPage() {
  const [postText, setPostText] = useState('');

  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-3">
      {/* Main feed */}
      <div className="space-y-4 lg:col-span-2">
        {/* Create post */}
        <Card>
          <div className="flex gap-3">
            <Avatar name="You" />
            <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="Nima bilan shug'ullanyapsiz?" rows={2} className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon"><Image className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Smile className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><MapPin className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Hash className="h-4 w-4" /></Button>
            </div>
            <Button size="sm" disabled={!postText.trim()}><Send className="h-3 w-3" /> Post</Button>
          </div>
        </Card>

        {/* Stories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[{ name: 'Siz', src: null }, { name: 'Aziz', src: 'AK' }, { name: 'Malika', src: 'MY' }, { name: 'Bobur', src: 'BE' }, { name: 'Sardor', src: 'S' }, { name: 'Nilufar', src: 'N' }, { name: 'Jasur', src: 'J' }].map((s, i) => (
            <button key={i} className="flex shrink-0 flex-col items-center gap-1">
              <div className={cn('flex h-14 w-14 items-center justify-center rounded-full p-0.5', i === 0 ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500')}>
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-950">
                  {s.src ? <Avatar name={s.src} /> : <Plus className="h-5 w-5" />}
                </div>
              </div>
              <span className="text-[10px]">{s.name}</span>
            </button>
          ))}
        </div>

        {/* Posts */}
        {POSTS.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar name={p.author.avatar} />
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{p.author.name}</p>
                    {p.author.verified && <span className="text-blue-500">✓</span>}
                  </div>
                  <p className="text-xs text-slate-500">{p.author.title} · {p.time}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm">{p.content}</p>

            {p.image && p.image.length === 1 && <div className="mt-3 flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 text-8xl">{p.image}</div>}

            {p.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {p.tags.map((t) => <span key={t} className="text-xs text-violet-500">#{t}</span>)}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className={cn(p.liked && 'text-red-500')}><Heart className={cn('h-4 w-4', p.liked && 'fill-current')} /> {p.likes}</Button>
                <Button variant="ghost" size="sm"><MessageCircle className="h-4 w-4" /> {p.comments}</Button>
                <Button variant="ghost" size="sm"><Share2 className="h-4 w-4" /> {p.shares}</Button>
              </div>
              <Button variant="ghost" size="icon"><Bookmark className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold"><TrendingUp className="h-4 w-4 text-violet-500" /> Trending</h3>
          <div className="space-y-2">
            {TRENDING.map((t) => (
              <button key={t.tag} className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="text-sm font-semibold text-violet-500">{t.tag}</span>
                <span className="text-xs text-slate-500">{t.posts} posts</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold"><Users className="h-4 w-4 text-violet-500" /> Tavsiya etilgan</h3>
          <div className="space-y-3">
            {SUGGESTIONS.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <Avatar name={s.avatar} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-[10px] text-slate-500">{s.title} · {s.mutual} mutual</p>
                </div>
                <Button size="sm" variant="outline">Follow</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-pink-500/10">
          <Sparkles className="h-8 w-8 text-violet-500" />
          <h3 className="mt-2 font-bold">AI bilan kuchliroq bo'ling</h3>
          <p className="mt-1 text-sm text-slate-500">20+ AI vositasi sizni kutmoqda</p>
          <Button className="mt-3 w-full" size="sm">AI ochish</Button>
        </Card>
      </div>
    </div>
  );
}
