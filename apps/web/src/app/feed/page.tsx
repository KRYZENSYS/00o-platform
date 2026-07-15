'use client';
import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Send, MoreHorizontal, Image, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea, Input } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatNumber, formatRelative, cn } from '@/lib/utils';

export default function FeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.feed.list({ limit: 30, offset: (page - 1) * 30 });
      setPosts((prev) => page === 1 ? (res.data || []) : [...prev, ...(res.data || [])]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const submitPost = async () => {
    if (!newPost.trim() || posting) return;
    setPosting(true);
    try {
      const res = await api.feed.create({ content: newPost });
      setPosts((p) => [res.data, ...p]);
      setNewPost('');
    } catch (e) { /* ignore */ }
    finally { setPosting(false); }
  };

  const toggleLike = async (postId: number, isLiked: boolean) => {
    setPosts((p) => p.map(x => x.id === postId ? { ...x, isLiked: !isLiked, likesCount: x.likesCount + (isLiked ? -1 : 1) } : x));
    try {
      if (isLiked) await api.feed.unlike(postId);
      else await api.feed.like(postId);
    } catch (e) {
      setPosts((p) => p.map(x => x.id === postId ? { ...x, isLiked, likesCount: x.likesCount } : x));
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><TrendingUp className="h-6 w-6 text-violet-500" /> Feed</h1>
        <p className="mt-1 text-sm text-slate-500">Jamoa yangiliklari, g'oyalar, muhokamalar</p>
      </div>

      {/* New post composer */}
      <Card className="mb-4 p-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-bold text-white">
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Nima haqida o'ylayapsiz?"
              rows={3}
              maxLength={2000}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost"><Image className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost"><Sparkles className="h-4 w-4" /> AI yordam</Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">{newPost.length}/2000</span>
                <Button size="sm" variant="gradient" onClick={submitPost} loading={posting} disabled={!newPost.trim()}>
                  <Send className="h-3.5 w-3.5" /> Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts */}
      {loading && posts.length === 0 ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />)}</div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center">
          <Sparkles className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h3 className="text-lg font-semibold">Feed bo'sh</h3>
          <p className="text-sm text-slate-500">Birinchi bo'lib post yozing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onLike={() => toggleLike(p.id, p.isLiked)} />
          ))}
          {posts.length >= 30 * page && (
            <div className="text-center">
              <Button variant="outline" onClick={() => { setPage(page + 1); load(); }} loading={loading}>
                Ko'proq yuklash
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onLike }: { post: any; onLike: () => void }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await api.feed.comments(post.id);
      setComments(res.data || []);
    } catch (e) { /* ignore */ }
    finally { setLoadingComments(false); }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.feed.addComment(post.id, { content: newComment });
      setComments((c) => [...c, res.data]);
      setNewComment('');
    } catch (e) { /* ignore */ }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-bold text-white">
          {post.user?.firstName?.[0] || post.user?.username?.[0] || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{post.user?.firstName} {post.user?.lastName}</p>
              <p className="text-xs text-slate-500">@{post.user?.username} • {formatRelative(post.createdAt)}</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
          {post.media?.length > 0 && (
            <div className={cn('mt-2 grid gap-1', post.media.length > 1 ? 'grid-cols-2' : '')}>
              {post.media.slice(0, 4).map((m: any, i: number) => (
                <img key={i} src={m.url} className="max-h-96 w-full rounded-xl object-cover" alt="" />
              ))}
            </div>
          )}
          {post.hashtags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.hashtags.map((tag: string) => <span key={tag} className="text-xs text-violet-500">#{tag}</span>)}
            </div>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <button onClick={onLike} className={cn('flex items-center gap-1 transition hover:text-pink-500', post.isLiked && 'text-pink-500')}>
              <Heart className={cn('h-4 w-4', post.isLiked && 'fill-pink-500')} /> {formatNumber(post.likesCount || 0)}
            </button>
            <button onClick={loadComments} className="flex items-center gap-1 transition hover:text-violet-500">
              <MessageCircle className="h-4 w-4" /> {formatNumber(post.commentsCount || 0)}
            </button>
            <button className="flex items-center gap-1 transition hover:text-blue-500">
              <Share2 className="h-4 w-4" /> {formatNumber(post.sharesCount || 0)}
            </button>
          </div>
          {showComments && (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex gap-2">
                <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} placeholder="Kommentariya..." />
                <Button size="sm" variant="gradient" onClick={addComment}><Send className="h-3.5 w-3.5" /></Button>
              </div>
              {loadingComments ? <Loader2 className="h-4 w-4 animate-spin" /> :
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-[10px] font-bold text-white">
                      {c.user?.firstName?.[0] || c.user?.username?.[0] || 'U'}
                    </div>
                    <div className="flex-1 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
                      <p className="text-xs font-semibold">{c.user?.firstName} @{c.user?.username}</p>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
