/**
 * 00o.uz API — Cloudflare Workers (Hono)
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { jwt, sign, verify } from 'hono/jwt';
import { serveStatic } from 'hono/cloudflare-workers';

export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  GROQ_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  ALLOWED_ORIGINS: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', async (c, next) => {
  const origins = c.env.ALLOWED_ORIGINS?.split(',') ?? ['*'];
  return cors({
    origin: origins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })(c, next);
});

// Health
app.get('/health', (c) => c.json({ status: 'ok', service: '00o-api', time: Date.now() }));

// ===== AUTH =====
app.post('/api/v1/auth/register', async (c) => {
  const { email, password, fullName } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Email and password required' }, 400);
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  try {
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, full_name) VALUES (?, ?, ?)'
    ).bind(id, email, fullName ?? null).run();
    const token = await sign({ id, email }, c.env.JWT_ACCESS_SECRET);
    return c.json({ success: true, data: { user: { id, email, fullName }, token } });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return c.json({ error: 'Email already exists' }, 409);
    }
    return c.json({ error: 'Registration failed' }, 500);
  }
});

app.post('/api/v1/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Email and password required' }, 400);
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) return c.json({ error: 'Invalid credentials' }, 401);
  const valid = await verifyPassword(password, user.password_hash as string);
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401);
  const token = await sign({ id: user.id, email }, c.env.JWT_ACCESS_SECRET);
  return c.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, fullName: user.full_name },
      token,
    },
  });
});

// ===== USERS =====
app.get('/api/v1/users/me', jwt({ secret: c => c.env.JWT_ACCESS_SECRET }), async (c) => {
  const payload = c.get('jwtPayload');
  const user = await c.env.DB.prepare('SELECT id, email, full_name, username, bio, role, plan, token_balance FROM users WHERE id = ?').bind(payload.id).first();
  return c.json({ success: true, data: user });
});

// ===== STARTUPS =====
app.get('/api/v1/startups', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT s.*, u.full_name as founder_name FROM startups s LEFT JOIN users u ON s.founder_id = u.id ORDER BY s.created_at DESC LIMIT 50'
  ).all();
  return c.json({ success: true, data: results });
});

app.post('/api/v1/startups', jwt({ secret: c => c.env.JWT_ACCESS_SECRET }), async (c) => {
  const payload = c.get('jwtPayload');
  const { name, slug, description, industry, stage } = await c.req.json();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO startups (id, name, slug, description, industry, stage, founder_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, name, slug, description, industry ?? null, stage ?? 'IDEA', payload.id).run();
  return c.json({ success: true, data: { id, name, slug } });
});

// ===== POSTS =====
app.get('/api/v1/posts', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT p.*, u.full_name as author_name, u.avatar_url as author_avatar FROM posts p LEFT JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC LIMIT 50'
  ).all();
  return c.json({ success: true, data: results });
});

app.post('/api/v1/posts', jwt({ secret: c => c.env.JWT_ACCESS_SECRET }), async (c) => {
  const payload = c.get('jwtPayload');
  const { content, type, images } = await c.req.json();
  if (!content) return c.json({ error: 'Content required' }, 400);
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO posts (id, content, type, author_id, images) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, content, type ?? 'GENERAL', payload.id, images ? JSON.stringify(images) : null).run();
  return c.json({ success: true, data: { id, content } });
});

// ===== JOBS =====
app.get('/api/v1/jobs', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM jobs ORDER BY created_at DESC LIMIT 50'
  ).all();
  return c.json({ success: true, data: results });
});

app.post('/api/v1/jobs', jwt({ secret: c => c.env.JWT_ACCESS_SECRET }), async (c) => {
  const payload = c.get('jwtPayload');
  const body = await c.req.json();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO jobs (id, title, description, company, location, remote, salary_min, salary_max, currency, type, skills, poster_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, body.title, body.description, body.company, body.location, body.remote ? 1 : 0, body.salaryMin ?? null, body.salaryMax ?? null, body.currency ?? 'UZS', body.type ?? 'FULL_TIME', JSON.stringify(body.skills ?? []), payload.id).run();
  return c.json({ success: true, data: { id } });
});

// ===== MARKETPLACE =====
app.get('/api/v1/marketplace', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM listings WHERE status = ? ORDER BY created_at DESC LIMIT 50'
  ).bind('ACTIVE').all();
  return c.json({ success: true, data: results });
});

app.post('/api/v1/marketplace', jwt({ secret: c => c.env.JWT_ACCESS_SECRET }), async (c) => {
  const payload = c.get('jwtPayload');
  const body = await c.req.json();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO listings (id, title, description, price, currency, category, images, location, seller_id) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, body.title, body.description, body.price, body.currency ?? 'UZS', body.category, JSON.stringify(body.images ?? []), body.location ?? null, payload.id).run();
  return c.json({ success: true, data: { id } });
});

// ===== INVESTORS =====
app.get('/api/v1/investors', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM investors ORDER BY created_at DESC LIMIT 50').all();
  return c.json({ success: true, data: results });
});

// ===== AI (Groq) =====
app.post('/api/v1/ai/chat', jwt({ secret: c => c.env.JWT_ACCESS_SECRET }), async (c) => {
  const { message, model = 'llama-3.1-8b-instant' } = await c.req.json();
  if (!message) return c.json({ error: 'Message required' }, 400);
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${c.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: "Sen 00o.uz platformasining AI yordamchisisan. O'zbek tilida javob ber. Qisqa va aniq." },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  const data: any = await res.json();
  return c.json({
    success: true,
    data: {
      content: data.choices?.[0]?.message?.content ?? '',
      model,
      usage: data.usage,
    },
  });
});

app.get('/api/v1/ai/models', (c) => c.json({
  success: true,
  data: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'Groq', tier: 'pro' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Instant)', provider: 'Groq', tier: 'free' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq', tier: 'pro' },
    { id: 'gemma2-9b-it', name: 'Gemma2 9B', provider: 'Groq', tier: 'free' },
  ],
}));

// ===== CHAT (simple) =====
app.get('/api/v1/chats', jwt({ secret: c => c.env.JWT_ACCESS_SECRET }), async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM chats ORDER BY created_at DESC LIMIT 50').all();
  return c.json({ success: true, data: results });
});

app.get('/api/v1/chats/:id/messages', jwt({ secret: c => c.env.JWT_ACCESS_SECRET }), async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(c.req.param('id')).all();
  return c.json({ success: true, data: results });
});

// ===== Feed =====
app.get('/api/v1/feed', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT p.*, u.full_name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC LIMIT 50'
  ).all();
  return c.json({ success: true, data: results });
});

// ===== Subscriptions =====
app.get('/api/v1/subscriptions/plans', (c) => c.json({
  success: true,
  data: [
    { id: 'FREE', name: 'Free', priceUZS: 0, features: ['Basic access'] },
    { id: 'PRO', name: 'Pro', priceUZS: 49000, features: ['AI chat', 'Priority support', 'Pro badge'] },
    { id: 'BUSINESS', name: 'Business', priceUZS: 199000, features: ['All Pro', 'Team', 'API', 'Custom domain'] },
  ],
}));

// ===== Helper =====
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const buf = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, buf, 256);
  return `${btoa(String.fromCharCode(...salt))}.${btoa(String.fromCharCode(...new Uint8Array(derived)))}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [saltStr, hashStr] = hash.split('.');
    const salt = Uint8Array.from(atob(saltStr), c => c.charCodeAt(0));
    const enc = new TextEncoder();
    const buf = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, buf, 256);
    return btoa(String.fromCharCode(...new Uint8Array(derived))) === hashStr;
  } catch {
    return false;
  }
}

app.notFound((c) => c.json({ error: 'Not found', path: c.req.path }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

export default app;
