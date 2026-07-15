-- 00o.uz Database Schema for Cloudflare D1
-- Run: wrangler d1 execute 00o-db --file=./schema.sql

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  telegram_id INTEGER UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'USER' CHECK(role IN ('USER','ADMIN','MODERATOR')),
  plan TEXT DEFAULT 'FREE' CHECK(plan IN ('FREE','PRO','BUSINESS')),
  token_balance INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_users_username ON users(username);

-- Startups
CREATE TABLE IF NOT EXISTS startups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  industry TEXT,
  stage TEXT DEFAULT 'IDEA' CHECK(stage IN ('IDEA','MVP','EARLY','GROWTH','SCALE')),
  website_url TEXT,
  funding_goal INTEGER,
  founder_id TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (founder_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_startups_slug ON startups(slug);
CREATE INDEX idx_startups_founder ON startups(founder_id);
CREATE INDEX idx_startups_industry ON startups(industry);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  author_id TEXT,
  type TEXT DEFAULT 'GENERAL' CHECK(type IN ('GENERAL','STARTUP_UPDATE','JOB','ANNOUNCEMENT')),
  images TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  author_id TEXT,
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chats
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'DIRECT' CHECK(type IN ('DIRECT','GROUP','CHANNEL')),
  name TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT,
  sender_id TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK(type IN ('text','image','file','voice')),
  read_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_chat ON messages(chat_id, created_at DESC);

-- Marketplace
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  currency TEXT DEFAULT 'UZS',
  category TEXT,
  images TEXT,
  location TEXT,
  seller_id TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','SOLD','CLOSED')),
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  company TEXT,
  location TEXT,
  remote INTEGER DEFAULT 0,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'UZS',
  type TEXT DEFAULT 'FULL_TIME' CHECK(type IN ('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','FREELANCE')),
  skills TEXT,
  poster_id TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Investors
CREATE TABLE IF NOT EXISTS investors (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  bio TEXT,
  website_url TEXT,
  focus_areas TEXT,
  ticket_size_min INTEGER,
  ticket_size_max INTEGER,
  currency TEXT DEFAULT 'USD',
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  title TEXT,
  body TEXT,
  read_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Token transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  amount INTEGER NOT NULL,
  type TEXT CHECK(type IN ('PURCHASE','SPEND','REWARD','TRANSFER')),
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  plan TEXT CHECK(plan IN ('FREE','PRO','BUSINESS')),
  started_at INTEGER,
  expires_at INTEGER,
  auto_renew INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT,
  referee_id TEXT,
  code TEXT UNIQUE,
  reward INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE
);
