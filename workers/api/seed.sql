-- 00o.uz Database Seed Data
-- Run: wrangler d1 execute 00o-db --file=./seed.sql

-- Admin user
INSERT OR REPLACE INTO users (id, email, full_name, username, role, plan, token_balance)
VALUES (
  'admin-001',
  'admin@00o.uz',
  '00o.uz Admin',
  'admin',
  'ADMIN',
  'BUSINESS',
  10000
);

-- Sample users
INSERT OR IGNORE INTO users (id, email, full_name, username, role, plan) VALUES
  ('user-001', 'ali@00o.uz', 'Ali Karimov', 'alikarimov', 'USER', 'PRO'),
  ('user-002', 'madina@00o.uz', 'Madina Yusupova', 'madina', 'USER', 'FREE'),
  ('user-003', 'jasur@00o.uz', 'Jasur Toshmatov', 'jasur', 'USER', 'PRO');

-- Sample startups
INSERT OR IGNORE INTO startups (id, name, slug, description, industry, stage, founder_id, funding_goal) VALUES
  ('startup-001', 'UzAI Lab', 'uzai-lab', 'O''zbek tilidagi AI yechimlari yaratuvchi startup. Tabiiy tilni qayta ishlash va chatbotlar.', 'AI/ML', 'MVP', 'user-001', 50000),
  ('startup-002', 'Toshkent Delivery', 'toshkent-delivery', 'Toshkent bo''ylab 30 daqiqada yetkazib berish xizmati. Mobile app.', 'Logistics', 'GROWTH', 'user-002', 200000),
  ('startup-003', 'EduPlatform', 'eduplatform', 'O''zbek tilidagi onlayn ta''lim platformasi. Video darslar, testlar, sertifikatlar.', 'EdTech', 'EARLY', 'user-003', 100000);

-- Sample posts
INSERT OR IGNORE INTO posts (id, content, type, author_id) VALUES
  ('post-001', 'Salom! Bugun 00o.uz platformasini ishga tushirdik! 🚀', 'ANNOUNCEMENT', 'admin-001'),
  ('post-002', 'Yangi AI chatbot''imiz tayyor. O''zbek tilida muloqot qilish mumkin.', 'STARTUP_UPDATE', 'user-001'),
  ('post-003', 'Toshkent delivery xizmati endi Yunusobod va Chilonzor tumanlarida!', 'STARTUP_UPDATE', 'user-002'),
  ('post-004', 'Senior Frontend dasturchi izlayapmiz. React, TypeScript, Next.js tajriba kerak.', 'JOB', 'user-003');

-- Sample jobs
INSERT OR IGNORE INTO jobs (id, title, description, company, location, remote, salary_min, salary_max, currency, type, skills) VALUES
  ('job-001', 'Senior Frontend Developer', 'React, Next.js, TypeScript, Tailwind CSS tajribasi. 3+ yil tajriba.', '00o.uz', 'Toshkent', 1, 15000000, 25000000, 'UZS', 'FULL_TIME', '["React","Next.js","TypeScript","Tailwind"]'),
  ('job-002', 'AI/ML Engineer', 'Python, PyTorch, LLM tajribasi. Groq, OpenAI API bilan ishlash.', 'UzAI Lab', 'Remote', 1, 20000000, 35000000, 'UZS', 'FULL_TIME', '["Python","PyTorch","LLM","NLP"]'),
  ('job-003', 'UI/UX Designer', 'Figma, dizayn tizimlari. Mobile va web dizayn.', 'Toshkent Delivery', 'Toshkent', 0, 8000000, 15000000, 'UZS', 'FULL_TIME', '["Figma","UI/UX","Prototyping"]');

-- Sample marketplace
INSERT OR IGNORE INTO listings (id, title, description, price, currency, category, location, seller_id) VALUES
  ('listing-001', 'MacBook Pro M2', '13 dyuym, 16GB RAM, 512GB SSD. 1 yil ishlatilgan. Kafolat bor.', 25000000, 'UZS', 'electronics', 'Toshkent', 'user-001'),
  ('listing-002', 'Web sayt yaratish xizmati', 'Zamonaviy dizayn, SEO optimallashtirilgan, mobile responsive. 3-5 kun.', 3000000, 'UZS', 'services', 'Remote', 'user-002'),
  ('listing-003', 'IELTS 7.5 ga tayyorlov', '5 yil tajribali o''qituvchi. Onlayn yoki ofisda. 2 oy kurs.', 1500000, 'UZS', 'education', 'Toshkent', 'user-003');

-- Sample investors
INSERT OR IGNORE INTO investors (id, user_id, name, bio, website_url, focus_areas, ticket_size_min, ticket_size_max, currency) VALUES
  ('inv-001', 'user-001', 'Texno Ventures', 'O''zbekistondagi texnologiya startaplariga sarmoya. AI, EdTech, FinTech.', 'https://texno.uz', '["AI","EdTech","FinTech"]', 10000, 100000, 'USD'),
  ('inv-002', 'user-002', 'Silk Road Capital', 'Markaziy Osiyo bo''ylab startaplarga sarmoya. 50+ portfel kompaniya.', 'https://silkroad.vc', '["Logistics","E-commerce","SaaS"]', 50000, 500000, 'USD');

-- Chat demo
INSERT OR IGNORE INTO chats (id, type, name) VALUES ('chat-001', 'GROUP', '00o.uz General');

INSERT OR IGNORE INTO messages (id, chat_id, sender_id, content) VALUES
  ('msg-001', 'chat-001', 'admin-001', 'Xush kelibsiz 00o.uz jamoasiga! 🎉'),
  ('msg-002', 'chat-001', 'user-001', 'Rahmat! Platforma juda zo''r chiqibdi.'),
  ('msg-003', 'chat-001', 'user-002', 'Qachon yangilanishlar bo''ladi?');
