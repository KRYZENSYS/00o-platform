'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, Loader2, Copy, Check, ExternalLink, Zap, Star, TrendingUp, Cloud, Bitcoin, Newspaper, Smile, Wrench, Globe, Users, Calculator, Image as ImageIcon, Type, Calendar, Shield, Lock, CheckCircle, ListChecks, ArrowRightLeft, BookOpen, Code2 } from 'lucide-react';

type Tool = {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST';
  path: string;
  category: string;
  emoji: string;
  params?: { name: string; type: 'text' | 'number' | 'select' | 'textarea'; placeholder?: string; default?: string; options?: string[] }[];
  response?: string;
};

const CATEGORIES: Record<string, { icon: any; color: string; gradient: string }> = {
  'AI & Chat': { icon: Sparkles, color: 'text-pink-400', gradient: 'from-pink-500/20 to-violet-500/20' },
  'Weather': { icon: Cloud, color: 'text-sky-400', gradient: 'from-sky-500/20 to-blue-500/20' },
  'Crypto & Finance': { icon: Bitcoin, color: 'text-amber-400', gradient: 'from-amber-500/20 to-orange-500/20' },
  'News & Content': { icon: Newspaper, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-teal-500/20' },
  'Fun & Entertainment': { icon: Smile, color: 'text-yellow-400', gradient: 'from-yellow-500/20 to-amber-500/20' },
  'Utility & Tools': { icon: Wrench, color: 'text-indigo-400', gradient: 'from-indigo-500/20 to-purple-500/20' },
  'Network & DNS': { icon: Globe, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-blue-500/20' },
  'Social & GitHub': { icon: Users, color: 'text-violet-400', gradient: 'from-violet-500/20 to-fuchsia-500/20' },
  'Science & Calc': { icon: Calculator, color: 'text-rose-400', gradient: 'from-rose-500/20 to-pink-500/20' },
  'Media & Images': { icon: ImageIcon, color: 'text-fuchsia-400', gradient: 'from-fuchsia-500/20 to-pink-500/20' },
  'Text Tools': { icon: Type, color: 'text-teal-400', gradient: 'from-teal-500/20 to-emerald-500/20' },
  'Date & Time': { icon: Calendar, color: 'text-orange-400', gradient: 'from-orange-500/20 to-amber-500/20' },
  'Validation': { icon: CheckCircle, color: 'text-lime-400', gradient: 'from-lime-500/20 to-green-500/20' },
  'Security': { icon: Lock, color: 'text-red-400', gradient: 'from-red-500/20 to-rose-500/20' },
  'Productivity': { icon: ListChecks, color: 'text-green-400', gradient: 'from-green-500/20 to-emerald-500/20' },
  'Converters': { icon: ArrowRightLeft, color: 'text-blue-400', gradient: 'from-blue-500/20 to-indigo-500/20' },
  'Reference': { icon: BookOpen, color: 'text-purple-400', gradient: 'from-purple-500/20 to-violet-500/20' },
  'Meta': { icon: Code2, color: 'text-gray-400', gradient: 'from-gray-500/20 to-slate-500/20' },
};

const TOOLS: Tool[] = [
  // AI & Chat (10)
  { id: 'chat', name: 'AI Chat', description: 'AI bilan suhbatlashish (UZ/RU/EN)', method: 'POST', path: '/api/tools/chat', category: 'AI & Chat', emoji: '💬', params: [{ name: 'message', type: 'text', placeholder: 'Savolingizni yozing...' }, { name: 'lang', type: 'select', options: ['uz', 'ru', 'en'], default: 'uz' }] },
  { id: 'summarize', name: 'Matn xulosasi', description: 'Matnni qisqacha qisqartirish', method: 'POST', path: '/api/tools/summarize', category: 'AI & Chat', emoji: '📝', params: [{ name: 'text', type: 'textarea', placeholder: 'Xulosa qilmoqchi bo\'lgan matn...' }, { name: 'sentences', type: 'number', default: '3' }] },
  { id: 'translate', name: 'Tarjimon', description: 'Matnni 100+ tilga tarjima qilish', method: 'POST', path: '/api/tools/translate', category: 'AI & Chat', emoji: '🌐', params: [{ name: 'text', type: 'textarea', placeholder: 'Tarjima qilish...' }, { name: 'to', type: 'select', options: ['en', 'ru', 'uz', 'tr', 'es', 'fr', 'de', 'zh', 'ar'], default: 'en' }] },
  { id: 'sentiment', name: 'Sentiment tahlil', description: 'Matn ijobiy yoki salbiy ekanini aniqlash', method: 'POST', path: '/api/tools/sentiment', category: 'AI & Chat', emoji: '😊', params: [{ name: 'text', type: 'textarea', placeholder: 'Tahlil qilish...' }] },
  { id: 'keywords', name: 'Kalit so\'zlar', description: 'Matndan asosiy so\'zlarni ajratib olish', method: 'POST', path: '/api/tools/keywords', category: 'AI & Chat', emoji: '🔑', params: [{ name: 'text', type: 'textarea' }, { name: 'top', type: 'number', default: '10' }] },
  { id: 'detect-lang', name: 'Til aniqlash', description: 'Matn qaysi tilda ekanini aniqlash', method: 'POST', path: '/api/tools/detect-language', category: 'AI & Chat', emoji: '🔍', params: [{ name: 'text', type: 'text' }] },
  { id: 'grammar', name: 'Grammatika tekshirish', description: 'Matndagi xatolarni topish', method: 'POST', path: '/api/tools/grammar-check', category: 'AI & Chat', emoji: '✅', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'readability', name: 'O\'qilishi', description: 'Matn o\'qish darajasini aniqlash', method: 'POST', path: '/api/tools/readability', category: 'AI & Chat', emoji: '📖', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'wordcount', name: 'So\'z hisoblash', description: 'So\'z, harf, jumla soni', method: 'POST', path: '/api/tools/word-count', category: 'AI & Chat', emoji: '🔢', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'plagiarism', name: 'O\'xshashlik', description: 'Matn o\'xshashligini tekshirish', method: 'POST', path: '/api/tools/plagiarism-check', category: 'AI & Chat', emoji: '🔎', params: [{ name: 'text', type: 'textarea' }] },

  // Weather (5)
  { id: 'weather', name: 'Ob-havo', description: 'Hozirgi ob-havo ma\'lumoti', method: 'GET', path: '/api/tools/weather', category: 'Weather', emoji: '🌤', params: [{ name: 'city', type: 'text', placeholder: 'Tashkent', default: 'Tashkent' }] },
  { id: 'forecast', name: '7 kunlik', description: 'Haftalik ob-havo prognozi', method: 'GET', path: '/api/tools/weather/forecast', category: 'Weather', emoji: '📅', params: [{ name: 'city', type: 'text', default: 'Tashkent' }, { name: 'days', type: 'number', default: '7' }] },
  { id: 'uv', name: 'UV indeksi', description: 'Quyosh nuri darajasi', method: 'GET', path: '/api/tools/weather/uv', category: 'Weather', emoji: '☀️', params: [{ name: 'city', type: 'text', default: 'Tashkent' }] },
  { id: 'air', name: 'Havo sifati', description: 'PM2.5, PM10, CO darajasi', method: 'GET', path: '/api/tools/weather/air-quality', category: 'Weather', emoji: '🌫', params: [{ name: 'lat', type: 'number', default: '41.31' }, { name: 'lon', type: 'number', default: '69.27' }] },
  { id: 'astro', name: 'Quyosh/Oy', description: 'Quyosh va Oy chiqishi', method: 'GET', path: '/api/tools/weather/astronomy', category: 'Weather', emoji: '🌙', params: [{ name: 'city', type: 'text', default: 'Tashkent' }] },

  // Crypto & Finance (8)
  { id: 'crypto-prices', name: 'Kripto narxlar', description: 'BTC, ETH va boshqa narxlar', method: 'GET', path: '/api/tools/crypto/prices', category: 'Crypto & Finance', emoji: '💰' },
  { id: 'crypto-coin', name: 'Kripto ma\'lumot', description: 'Muayyan kripto haqida', method: 'GET', path: '/api/tools/crypto/coin/:id', category: 'Crypto & Finance', emoji: '🪙', params: [{ name: 'id', type: 'text', placeholder: 'bitcoin', default: 'bitcoin' }] },
  { id: 'crypto-trend', name: 'Trend kriptolar', description: 'Hozirda mashhur kriptolar', method: 'GET', path: '/api/tools/crypto/trending', category: 'Crypto & Finance', emoji: '📈' },
  { id: 'crypto-global', name: 'Global statistika', description: 'Butun dunyo bo\'yicha kripto', method: 'GET', path: '/api/tools/crypto/global', category: 'Crypto & Finance', emoji: '🌍' },
  { id: 'crypto-markets', name: 'Bozorlar', description: 'Top 50 kriptovalyutalar', method: 'GET', path: '/api/tools/crypto/markets', category: 'Crypto & Finance', emoji: '🏪' },
  { id: 'currency', name: 'Valyuta kurslari', description: 'Barcha valyutalar kursi', method: 'GET', path: '/api/tools/currency', category: 'Crypto & Finance', emoji: '💱', params: [{ name: 'base', type: 'text', default: 'USD' }] },
  { id: 'convert', name: 'Valyuta konvertatsiya', description: 'Bitta valyutani boshqasiga', method: 'POST', path: '/api/tools/currency/convert', category: 'Crypto & Finance', emoji: '🔄', params: [{ name: 'from', type: 'text', default: 'USD' }, { name: 'to', type: 'text', default: 'UZS' }, { name: 'amount', type: 'number', default: '100' }] },
  { id: 'stock', name: 'Aksiyalar', description: 'Aksiya narxlari (Yahoo Finance)', method: 'GET', path: '/api/tools/stock/:symbol', category: 'Crypto & Finance', emoji: '📊', params: [{ name: 'symbol', type: 'text', placeholder: 'AAPL', default: 'AAPL' }] },

  // News & Content (6)
  { id: 'news', name: 'Yangiliklar', description: 'Hacker News top yangiliklar', method: 'GET', path: '/api/tools/news', category: 'News & Content', emoji: '📰' },
  { id: 'reddit', name: 'Reddit', description: 'Reddit subreddit yangiliklari', method: 'GET', path: '/api/tools/news/reddit/:subreddit', category: 'News & Content', emoji: '💬', params: [{ name: 'subreddit', type: 'text', placeholder: 'programming', default: 'programming' }] },
  { id: 'news-search', name: 'Yangilik qidirish', description: 'Yangiliklar ichidan qidirish', method: 'GET', path: '/api/tools/news/search', category: 'News & Content', emoji: '🔍', params: [{ name: 'q', type: 'text', placeholder: 'AI', default: 'AI' }] },
  { id: 'wiki', name: 'Wikipedia', description: 'Vikipediya maqolalari', method: 'GET', path: '/api/tools/wikipedia', category: 'News & Content', emoji: '📚', params: [{ name: 'q', type: 'text', placeholder: 'Tashkent', default: 'Tashkent' }] },
  { id: 'quote', name: 'Iqtibos', description: 'Mashhur iqtiboslar', method: 'GET', path: '/api/tools/quote', category: 'News & Content', emoji: '💭' },
  { id: 'quote-multi', name: 'Iqtiboslar', description: 'Bir nechta iqtibos', method: 'GET', path: '/api/tools/quote/multiple', category: 'News & Content', emoji: '✨', params: [{ name: 'count', type: 'number', default: '5' }] },

  // Fun & Entertainment (15)
  { id: 'joke', name: 'Hazil', description: 'Random hazil', method: 'GET', path: '/api/tools/joke', category: 'Fun & Entertainment', emoji: '😄' },
  { id: 'joke-prog', name: 'Dasturchi hazili', description: 'IT sohasiga oid hazillar', method: 'GET', path: '/api/tools/joke/programming', category: 'Fun & Entertainment', emoji: '👨‍💻' },
  { id: 'joke-dad', name: 'Dad hazili', description: 'Klassik dad jokes', method: 'GET', path: '/api/tools/joke/dad', category: 'Fun & Entertainment', emoji: '👨' },
  { id: 'fact', name: 'Qiziqarli fakt', description: 'Random qiziqarli fakt', method: 'GET', path: '/api/tools/fun/fact', category: 'Fun & Entertainment', emoji: '💡' },
  { id: 'activity', name: 'Faoliyat', description: 'Bo\'sh vaqtingiz uchun g\'oya', method: 'GET', path: '/api/tools/fun/activity', category: 'Fun & Entertainment', emoji: '🎨' },
  { id: 'dog', name: 'Kuchukcha', description: 'Random kuchukcha rasmi', method: 'GET', path: '/api/tools/fun/dog', category: 'Fun & Entertainment', emoji: '🐶' },
  { id: 'cat', name: 'Mushuk', description: 'Random mushuk rasmi', method: 'GET', path: '/api/tools/fun/cat', category: 'Fun & Entertainment', emoji: '🐱' },
  { id: 'fox', name: 'Tulki', description: 'Random tulki rasmi', method: 'GET', path: '/api/tools/fun/fox', category: 'Fun & Entertainment', emoji: '🦊' },
  { id: 'dog-facts', name: 'Kuchuk faktlari', description: 'Kuchuklar haqida faktlar', method: 'GET', path: '/api/tools/fun/dog/facts', category: 'Fun & Entertainment', emoji: '📖' },
  { id: 'advice', name: 'Maslahat', description: 'Kundalik maslahat', method: 'GET', path: '/api/tools/fun/advice', category: 'Fun & Entertainment', emoji: '💡' },
  { id: 'yesno', name: 'Ha/Yuq', description: 'Random ha yoki yo\'q', method: 'GET', path: '/api/tools/fun/yesno', category: 'Fun & Entertainment', emoji: '❓' },
  { id: 'truth', name: 'Haqiqat', description: 'Truth or dare savol', method: 'GET', path: '/api/tools/fun/truth', category: 'Fun & Entertainment', emoji: '💯' },
  { id: 'dare', name: 'Qiyin vazifa', description: 'Dare - qiyin ish', method: 'GET', path: '/api/tools/fun/dare', category: 'Fun & Entertainment', emoji: '💪' },
  { id: 'riddle', name: 'Boshqotirma', description: 'Boshqotirma savol-javob', method: 'GET', path: '/api/tools/fun/riddle', category: 'Fun & Entertainment', emoji: '🧩' },
  { id: 'random-user', name: 'Foydalanuvchi', description: 'Random foydalanuvchi ma\'lumotlari', method: 'GET', path: '/api/tools/fun/random-user', category: 'Fun & Entertainment', emoji: '👤' },

  // Utility & Tools (25)
  { id: 'uuid', name: 'UUID generator', description: 'Unikal ID yaratish (v4)', method: 'GET', path: '/api/tools/uuid', category: 'Utility & Tools', emoji: '🆔', params: [{ name: 'count', type: 'number', default: '1' }] },
  { id: 'password', name: 'Parol', description: 'Kuchli parol yaratish', method: 'GET', path: '/api/tools/password', category: 'Utility & Tools', emoji: '🔐', params: [{ name: 'length', type: 'number', default: '20' }, { name: 'count', type: 'number', default: '1' }] },
  { id: 'hash', name: 'Hash', description: 'SHA-256/SHA-512 hashing', method: 'POST', path: '/api/tools/hash', category: 'Utility & Tools', emoji: '#️⃣', params: [{ name: 'text', type: 'textarea' }, { name: 'algo', type: 'select', options: ['SHA-256', 'SHA-384', 'SHA-512'], default: 'SHA-256' }] },
  { id: 'b64-enc', name: 'Base64 kodlash', description: 'Matnni Base64 ga', method: 'POST', path: '/api/tools/base64/encode', category: 'Utility & Tools', emoji: '🔡', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'b64-dec', name: 'Base64 ochish', description: 'Base64 dan matnga', method: 'POST', path: '/api/tools/base64/decode', category: 'Utility & Tools', emoji: '🔠', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'url-enc', name: 'URL kodlash', description: 'Matnni URL uchun', method: 'POST', path: '/api/tools/url/encode', category: 'Utility & Tools', emoji: '🔗', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'url-dec', name: 'URL ochish', description: 'URL dan matnga', method: 'POST', path: '/api/tools/url/decode', category: 'Utility & Tools', emoji: '🌐', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'jwt-dec', name: 'JWT tahlil', description: 'JWT tokenini dekodlash', method: 'POST', path: '/api/tools/jwt/decode', category: 'Utility & Tools', emoji: '🎫', params: [{ name: 'token', type: 'textarea' }] },
  { id: 'lorem', name: 'Lorem Ipsum', description: 'Demo matn generatori', method: 'POST', path: '/api/tools/lorem-ipsum', category: 'Utility & Tools', emoji: '📜', params: [{ name: 'paragraphs', type: 'number', default: '3' }] },
  { id: 'color-rand', name: 'Random rang', description: 'Tasodifiy rang', method: 'POST', path: '/api/tools/color/random', category: 'Utility & Tools', emoji: '🎨' },
  { id: 'color-pal', name: 'Rang palitralari', description: 'Tayyor ranglar to\'plami', method: 'GET', path: '/api/tools/color/palette/:type', category: 'Utility & Tools', emoji: '🌈', params: [{ name: 'type', type: 'select', options: ['pastel', 'neon', 'earth', 'monochrome'], default: 'pastel' }] },
  { id: 'qr', name: 'QR kod', description: 'QR kod yaratish', method: 'POST', path: '/api/tools/qrcode', category: 'Utility & Tools', emoji: '📱', params: [{ name: 'data', type: 'text', default: 'https://00o.uz' }, { name: 'size', type: 'number', default: '300' }] },
  { id: 'avatar', name: 'Avatar', description: '5 xil uslubda avatar', method: 'GET', path: '/api/tools/avatar/:seed', category: 'Utility & Tools', emoji: '👤', params: [{ name: 'seed', type: 'text', default: 'user' }] },
  { id: 'gradient', name: 'CSS Gradient', description: 'Chiroyli gradient', method: 'GET', path: '/api/tools/gradient', category: 'Utility & Tools', emoji: '🌅', params: [{ name: 'c1', type: 'text', default: 'FF006E' }, { name: 'c2', type: 'text', default: '3A86FF' }, { name: 'angle', type: 'number', default: '45' }] },
  { id: 'dice', name: 'Zar', description: '6 yuzli zar tashlash', method: 'GET', path: '/api/tools/dice', category: 'Utility & Tools', emoji: '🎲' },
  { id: 'coin', name: 'Tanga', description: 'Tanga tashlash', method: 'GET', path: '/api/tools/coin-flip', category: 'Utility & Tools', emoji: '🪙' },
  { id: 'dice-multi', name: 'Ko\'p zar', description: '20 tagacha zar', method: 'GET', path: '/api/tools/dice/multi', category: 'Utility & Tools', emoji: '🎲', params: [{ name: 'count', type: 'number', default: '2' }, { name: 'sides', type: 'number', default: '6' }] },
  { id: 'rand-num', name: 'Random son', description: 'Oraliqda son', method: 'GET', path: '/api/tools/random-number', category: 'Utility & Tools', emoji: '🔢', params: [{ name: 'min', type: 'number', default: '1' }, { name: 'max', type: 'number', default: '100' }] },
  { id: 'rand-str', name: 'Random string', description: 'Tasodifiy belgilar', method: 'GET', path: '/api/tools/random-string', category: 'Utility & Tools', emoji: '🔤', params: [{ name: 'length', type: 'number', default: '16' }, { name: 'charset', type: 'select', options: ['alphanumeric', 'alpha', 'numeric', 'hex'], default: 'alphanumeric' }] },
  { id: 'age', name: 'Yosh hisoblash', description: 'Tug\'ilgan sanadan yosh', method: 'GET', path: '/api/tools/age-calculator', category: 'Utility & Tools', emoji: '🎂', params: [{ name: 'birthdate', type: 'text', placeholder: '1990-01-15', default: '1990-01-15' }] },
  { id: 'bmi', name: 'BMI', description: 'Tana massasi indeksi', method: 'GET', path: '/api/tools/bmi', category: 'Utility & Tools', emoji: '⚖️', params: [{ name: 'weight', type: 'number', default: '70' }, { name: 'height', type: 'number', default: '175' }] },
  { id: 'percent', name: 'Foiz', description: 'Foiz hisoblash', method: 'POST', path: '/api/tools/percentage', category: 'Utility & Tools', emoji: '％', params: [{ name: 'value', type: 'number' }, { name: 'percent', type: 'number' }, { name: 'mode', type: 'select', options: ['of', 'increase', 'decrease', 'reverse'], default: 'of' }] },
  { id: 'days', name: 'Kun farqi', description: 'Ikki sana orasi', method: 'GET', path: '/api/tools/days-between', category: 'Utility & Tools', emoji: '📆', params: [{ name: 'from', type: 'text', default: '2026-01-01' }, { name: 'to', type: 'text', default: '2026-12-31' }] },
  { id: 'json-fmt', name: 'JSON formatlash', description: 'JSON ni chiroyli qilish', method: 'POST', path: '/api/tools/json/format', category: 'Utility & Tools', emoji: '📋', params: [{ name: 'json', type: 'textarea' }] },
  { id: 'regex', name: 'Regex test', description: 'Regex tekshirish', method: 'POST', path: '/api/tools/regex/test', category: 'Utility & Tools', emoji: '🔍', params: [{ name: 'pattern', type: 'text' }, { name: 'text', type: 'textarea' }, { name: 'flags', type: 'text', default: 'g' }] },

  // Network & DNS (10)
  { id: 'ip', name: 'Mening IP', description: 'Sizning IP ma\'lumotlari', method: 'GET', path: '/api/tools/ip', category: 'Network & DNS', emoji: '🌐' },
  { id: 'ip-look', name: 'IP lookup', description: 'IP haqida to\'liq', method: 'GET', path: '/api/tools/ip/lookup', category: 'Network & DNS', emoji: '🔍', params: [{ name: 'ip', type: 'text', placeholder: '8.8.8.8', default: '8.8.8.8' }] },
  { id: 'dns', name: 'DNS lookup', description: 'Domain DNS yozuvlari', method: 'GET', path: '/api/tools/dns', category: 'Network & DNS', emoji: '📡', params: [{ name: 'domain', type: 'text', default: 'google.com' }, { name: 'type', type: 'select', options: ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'], default: 'A' }] },
  { id: 'whois', name: 'Whois', description: 'Domain egasi ma\'lumotlari', method: 'GET', path: '/api/tools/whois', category: 'Network & DNS', emoji: '🔎', params: [{ name: 'domain', type: 'text', default: 'google.com' }] },
  { id: 'headers', name: 'HTTP Headers', description: 'Sayt headerlarini ko\'rish', method: 'GET', path: '/api/tools/headers', category: 'Network & DNS', emoji: '📋', params: [{ name: 'url', type: 'text', default: 'https://google.com' }] },
  { id: 'ping', name: 'Ping', description: 'Sayt tezligini o\'lchash', method: 'GET', path: '/api/tools/ping', category: 'Network & DNS', emoji: '📶', params: [{ name: 'url', type: 'text', default: 'https://google.com' }] },
  { id: 'ssl', name: 'SSL tekshirish', description: 'SSL sertifikat holati', method: 'GET', path: '/api/tools/ssl-check', category: 'Network & DNS', emoji: '🔒', params: [{ name: 'domain', type: 'text', default: 'google.com' }] },
  { id: 'subdomains', name: 'Subdomainlar', description: 'Subdomainlarni topish', method: 'GET', path: '/api/tools/subdomains', category: 'Network & DNS', emoji: '🌐', params: [{ name: 'domain', type: 'text', default: 'github.com' }] },
  { id: 'port', name: 'Port tekshirish', description: 'Port ochiq-yoqligi', method: 'GET', path: '/api/tools/port-check', category: 'Network & DNS', emoji: '🔌', params: [{ name: 'host', type: 'text', default: 'google.com' }, { name: 'port', type: 'number', default: '80' }] },
  { id: 'shorten', name: 'URL qisqartirish', description: 'Uzun URL ni qisqa qilish', method: 'GET', path: '/api/tools/shorten', category: 'Network & DNS', emoji: '🔗', params: [{ name: 'url', type: 'text', default: 'https://00o.uz' }] },

  // Social & GitHub (8)
  { id: 'gh-user', name: 'GitHub user', description: 'GitHub foydalanuvchi', method: 'GET', path: '/api/tools/github/user/:username', category: 'Social & GitHub', emoji: '👤', params: [{ name: 'username', type: 'text', default: 'torvalds' }] },
  { id: 'gh-repo', name: 'GitHub repo', description: 'Repo haqida ma\'lumot', method: 'GET', path: '/api/tools/github/repo/:owner/:repo', category: 'Social & GitHub', emoji: '📦', params: [{ name: 'owner', type: 'text', default: 'vercel' }, { name: 'repo', type: 'text', default: 'next.js' }] },
  { id: 'gh-trend', name: 'GitHub trend', description: 'Trend repositorylar', method: 'GET', path: '/api/tools/github/trending', category: 'Social & GitHub', emoji: '🔥' },
  { id: 'gh-lang', name: 'GitHub languages', description: 'Repo tillari', method: 'GET', path: '/api/tools/github/languages', category: 'Social & GitHub', emoji: '🗣', params: [{ name: 'owner', type: 'text', default: 'vercel' }, { name: 'repo', type: 'text', default: 'next.js' }] },
  { id: 'countries', name: 'Davlatlar', description: 'Barcha davlatlar', method: 'GET', path: '/api/tools/countries', category: 'Social & GitHub', emoji: '🌍' },
  { id: 'country', name: 'Davlat', description: 'Muayyan davlat', method: 'GET', path: '/api/tools/country/:name', category: 'Social & GitHub', emoji: '🏳️', params: [{ name: 'name', type: 'text', default: 'Uzbekistan' }] },
  { id: 'holidays', name: 'Bayramlar', description: 'Davlat bayramlari', method: 'GET', path: '/api/tools/holidays', category: 'Social & GitHub', emoji: '🎉', params: [{ name: 'country', type: 'text', default: 'UZ' }, { name: 'year', type: 'number', default: '2026' }] },
  { id: 'tz', name: 'Vaqt mintaqasi', description: 'Boshqa vaqt mintaqasi', method: 'GET', path: '/api/tools/timezone', category: 'Social & GitHub', emoji: '🕐', params: [{ name: 'zone', type: 'text', default: 'Asia/Tashkent' }] },

  // Science & Calc (12)
  { id: 'calc', name: 'Kalkulyator', description: 'Matematik ifodalar', method: 'POST', path: '/api/tools/calc/basic', category: 'Science & Calc', emoji: '🧮', params: [{ name: 'expression', type: 'text', default: '2+2*3' }] },
  { id: 'tip', name: 'Choy puli', description: 'Choy pulasini hisoblash', method: 'GET', path: '/api/tools/calc/tip', category: 'Science & Calc', emoji: '💵', params: [{ name: 'amount', type: 'number', default: '100' }, { name: 'percent', type: 'number', default: '15' }, { name: 'people', type: 'number', default: '1' }] },
  { id: 'loan', name: 'Kredit kalkulyator', description: 'Oylik to\'lov hisoblash', method: 'POST', path: '/api/tools/calc/loan', category: 'Science & Calc', emoji: '🏦', params: [{ name: 'principal', type: 'number', default: '10000' }, { name: 'rate', type: 'number', default: '15' }, { name: 'years', type: 'number', default: '5' }] },
  { id: 'compound', name: 'Murakkab foiz', description: 'Investitsiya o\'sishi', method: 'POST', path: '/api/tools/calc/compound', category: 'Science & Calc', emoji: '📈', params: [{ name: 'principal', type: 'number', default: '1000' }, { name: 'rate', type: 'number', default: '10' }, { name: 'years', type: 'number', default: '5' }, { name: 'monthly', type: 'number', default: '100' }] },
  { id: 'area', name: 'Yuza', description: 'Geometrik shakl yuzasi', method: 'POST', path: '/api/tools/calc/area', category: 'Science & Calc', emoji: '📐', params: [{ name: 'shape', type: 'select', options: ['rectangle', 'triangle', 'circle', 'square'], default: 'rectangle' }, { name: 'length', type: 'number', default: '5' }, { name: 'width', type: 'number', default: '3' }] },
  { id: 'discount', name: 'Chegirma', description: 'Chegirma narxini hisoblash', method: 'POST', path: '/api/tools/calc/discount', category: 'Science & Calc', emoji: '🏷️', params: [{ name: 'price', type: 'number', default: '100' }, { name: 'percent', type: 'number', default: '20' }] },
  { id: 'salary', name: 'Oylik', description: 'Sof oylik hisoblash', method: 'POST', path: '/api/tools/calc/salary', category: 'Science & Calc', emoji: '💰', params: [{ name: 'gross', type: 'number', default: '5000000' }] },
  { id: 'pets', name: 'Uy hayvoni yoshi', description: 'It/mushuk yoshini inson yoshiga', method: 'POST', path: '/api/tools/calc/age-pets', category: 'Science & Calc', emoji: '🐾', params: [{ name: 'age', type: 'number', default: '5' }, { name: 'type', type: 'select', options: ['dog', 'cat', 'hamster'], default: 'dog' }] },
  { id: 'length', name: 'Uzunlik', description: 'm/km/mi/ft/yard', method: 'GET', path: '/api/tools/units/length', category: 'Science & Calc', emoji: '📏', params: [{ name: 'value', type: 'number', default: '1' }, { name: 'from', type: 'select', options: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'inch'], default: 'km' }, { name: 'to', type: 'select', options: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'inch'], default: 'm' }] },
  { id: 'weight', name: 'Og\'irlik', description: 'kg/g/lb/oz/tonna', method: 'GET', path: '/api/tools/units/weight', category: 'Science & Calc', emoji: '⚖️', params: [{ name: 'value', type: 'number', default: '1' }, { name: 'from', type: 'select', options: ['kg', 'g', 'mg', 'lb', 'oz', 'ton'], default: 'kg' }, { name: 'to', type: 'select', options: ['kg', 'g', 'mg', 'lb', 'oz', 'ton'], default: 'lb' }] },
  { id: 'temp', name: 'Harorat', description: 'C/F/K ga o\'tkazish', method: 'GET', path: '/api/tools/units/temperature', category: 'Science & Calc', emoji: '🌡', params: [{ name: 'value', type: 'number', default: '25' }, { name: 'from', type: 'select', options: ['C', 'F', 'K'], default: 'C' }, { name: 'to', type: 'select', options: ['C', 'F', 'K'], default: 'F' }] },
  { id: 'circle', name: 'Aylana', description: 'Aylana parametrlari', method: 'POST', path: '/api/tools/calc/circle', category: 'Science & Calc', emoji: '⭕', params: [{ name: 'radius', type: 'number', default: '5' }] },

  // Media & Images (8)
  { id: 'unsplash', name: 'Unsplash', description: 'Bepul yuqori sifatli rasm', method: 'GET', path: '/api/tools/unsplash', category: 'Media & Images', emoji: '📷', params: [{ name: 'q', type: 'text', default: 'nature' }, { name: 'count', type: 'number', default: '5' }] },
  { id: 'picsum', name: 'Picsum', description: 'Random rasm', method: 'GET', path: '/api/tools/picsum', category: 'Media & Images', emoji: '🖼', params: [{ name: 'count', type: 'number', default: '5' }] },
  { id: 'placeholder', name: 'Placeholder', description: 'Matnli rasm', method: 'GET', path: '/api/tools/placeholder', category: 'Media & Images', emoji: '🖼', params: [{ name: 'w', type: 'number', default: '400' }, { name: 'h', type: 'number', default: '300' }, { name: 'text', type: 'text', default: '00o.uz' }] },
  { id: 'robohash', name: 'Robohash', description: 'Robot avatar', method: 'GET', path: '/api/tools/robohash/:seed', category: 'Media & Images', emoji: '🤖', params: [{ name: 'seed', type: 'text', default: 'user' }] },
  { id: 'screenshot', name: 'Screenshot', description: 'Sayt rasmi', method: 'GET', path: '/api/tools/screenshot', category: 'Media & Images', emoji: '📸', params: [{ name: 'url', type: 'text', default: 'https://00o.uz' }] },
  { id: 'meme', name: 'Meme', description: 'Meme yaratish', method: 'GET', path: '/api/tools/meme', category: 'Media & Images', emoji: '😂', params: [{ name: 'top', type: 'text', default: 'Hello' }, { name: 'bottom', type: 'text', default: 'World' }] },
  { id: 'emoji-search', name: 'Emoji qidirish', description: 'Emoji topish', method: 'GET', path: '/api/tools/emoji/search', category: 'Media & Images', emoji: '😀', params: [{ name: 'q', type: 'text', default: 'love' }] },
  { id: 'wallpaper', name: 'Wallpaper', description: 'HD fon rasmi', method: 'GET', path: '/api/tools/wallpaper', category: 'Media & Images', emoji: '🌄', params: [{ name: 'w', type: 'number', default: '1920' }, { name: 'h', type: 'number', default: '1080' }] },

  // Text Tools (10)
  { id: 'upper', name: 'Katta harf', description: 'Barcha harflar KATTA', method: 'POST', path: '/api/tools/case/upper', category: 'Text Tools', emoji: '🔠', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'lower', name: 'Kichik harf', description: 'Barcha harflar kichik', method: 'POST', path: '/api/tools/case/lower', category: 'Text Tools', emoji: '🔡', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'title', name: 'Title Case', description: 'Har So\'z Bosh Harfi', method: 'POST', path: '/api/tools/case/title', category: 'Text Tools', emoji: 'T', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'sentence', name: 'Sentence case', description: 'Faqat bosh harf', method: 'POST', path: '/api/tools/case/sentence', category: 'Text Tools', emoji: 'Aa', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'reverse', name: 'Teskari matn', description: 'Matnni teskari aylantirish', method: 'POST', path: '/api/tools/reverse', category: 'Text Tools', emoji: '🔄', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'palindrome', name: 'Palindrom', description: 'Palindrom ekanligini tekshirish', method: 'POST', path: '/api/tools/palindrome', category: 'Text Tools', emoji: '🪞', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'word-freq', name: 'So\'z chastotasi', description: 'Eng ko\'p ishlatilgan so\'zlar', method: 'POST', path: '/api/tools/word/frequency', category: 'Text Tools', emoji: '📊', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'dedup', name: 'Takrorlarsiz', description: 'Takrorlangan qatorlarni o\'chirish', method: 'POST', path: '/api/tools/remove-duplicates', category: 'Text Tools', emoji: '🗑', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'sort-lines', name: 'Tartiblash', description: 'Qatorlarni alfavit bo\'yicha', method: 'POST', path: '/api/tools/sort/lines', category: 'Text Tools', emoji: '🔤', params: [{ name: 'text', type: 'textarea' }, { name: 'order', type: 'select', options: ['asc', 'desc'], default: 'asc' }] },
  { id: 'char-count', name: 'Harf hisoblash', description: 'Har bir harf necha marta', method: 'POST', path: '/api/tools/character-count', category: 'Text Tools', emoji: '🔢', params: [{ name: 'text', type: 'textarea' }] },

  // Date & Time (8)
  { id: 'time-now', name: 'Hozirgi vaqt', description: 'Joriy vaqt', method: 'GET', path: '/api/tools/time/now', category: 'Date & Time', emoji: '🕐', params: [{ name: 'zone', type: 'text', default: 'Asia/Tashkent' }] },
  { id: 'unix', name: 'Unix timestamp', description: 'Hozirgi Unix vaqti', method: 'GET', path: '/api/tools/time/unix', category: 'Date & Time', emoji: '⏱' },
  { id: 'time-conv', name: 'Vaqt konvertatsiya', description: 'Unix dan vaqtga', method: 'POST', path: '/api/tools/time/convert', category: 'Date & Time', emoji: '🔄', params: [{ name: 'unix', type: 'number' }, { name: 'zone', type: 'text', default: 'Asia/Tashkent' }] },
  { id: 'stopwatch', name: 'Stopwatch', description: 'Vaqt o\'lchash', method: 'GET', path: '/api/tools/time/stopwatch/start', category: 'Date & Time', emoji: '⏱' },
  { id: 'cal', name: 'Kalendar', description: 'Oy kalendari', method: 'GET', path: '/api/tools/calendar/:year/:month', category: 'Date & Time', emoji: '📅', params: [{ name: 'year', type: 'number', default: '2026' }, { name: 'month', type: 'number', default: '7' }] },
  { id: 'dow', name: 'Hafta kuni', description: 'Qaysi kun ekanligi', method: 'GET', path: '/api/tools/day-of-week', category: 'Date & Time', emoji: '📆', params: [{ name: 'date', type: 'text', default: '2026-07-15' }] },
  { id: 'countdown', name: 'Teskari taymer', description: 'Sana qancha vaqt qolgani', method: 'GET', path: '/api/tools/countdown', category: 'Date & Time', emoji: '⏳', params: [{ name: 'date', type: 'text', default: '2027-01-01' }] },
  { id: 'timezones', name: 'Vaqt mintaqalari', description: 'Barcha mintaqalar', method: 'GET', path: '/api/tools/timezone', category: 'Date & Time', emoji: '🌐', params: [{ name: 'zone', type: 'text', default: 'UTC' }] },

  // Validation (8)
  { id: 'v-email', name: 'Email tekshirish', description: 'Email haqiqiyligini tekshirish', method: 'POST', path: '/api/tools/validate/email', category: 'Validation', emoji: '📧', params: [{ name: 'email', type: 'text', default: 'test@example.com' }] },
  { id: 'v-phone', name: 'Telefon raqam', description: 'Telefon raqam tekshirish', method: 'POST', path: '/api/tools/validate/phone', category: 'Validation', emoji: '📱', params: [{ name: 'phone', type: 'text', default: '+998901234567' }] },
  { id: 'v-url', name: 'URL tekshirish', description: 'URL to\'g\'ri ekanligini tekshirish', method: 'POST', path: '/api/tools/validate/url', category: 'Validation', emoji: '🔗', params: [{ name: 'url', type: 'text', default: 'https://00o.uz' }] },
  { id: 'v-card', name: 'Karta raqam', description: 'Karta raqam (Luhn algoritmi)', method: 'POST', path: '/api/tools/validate/credit-card', category: 'Validation', emoji: '💳', params: [{ name: 'number', type: 'text', default: '4532015112830366' }] },
  { id: 'v-ip', name: 'IP tekshirish', description: 'IP manzil tekshirish', method: 'POST', path: '/api/tools/validate/ip', category: 'Validation', emoji: '🌐', params: [{ name: 'ip', type: 'text', default: '8.8.8.8' }] },
  { id: 'v-pass', name: 'Parol kuchi', description: 'Parol kuchini aniqlash', method: 'POST', path: '/api/tools/validate/password', category: 'Validation', emoji: '🔐', params: [{ name: 'password', type: 'text', default: 'MyStr0ng!Pass' }] },
  { id: 'v-user', name: 'Username', description: 'Foydalanuvchi nomi tekshirish', method: 'POST', path: '/api/tools/validate/username', category: 'Validation', emoji: '👤', params: [{ name: 'username', type: 'text', default: 'user_123' }] },
  { id: 'v-iban', name: 'IBAN tekshirish', description: 'IBAN validatsiyasi', method: 'POST', path: '/api/tools/validate/iban', category: 'Validation', emoji: '🏦', params: [{ name: 'iban', type: 'text', default: 'UZ12345678901234567890' }] },

  // Security (5)
  { id: 'caesar', name: 'Sezar shifri', description: 'Matnni Sezar usulida shifrlash', method: 'POST', path: '/api/tools/encrypt/caesar', category: 'Security', emoji: '🔐', params: [{ name: 'text', type: 'textarea' }, { name: 'shift', type: 'number', default: '3' }, { name: 'decrypt', type: 'select', options: ['false', 'true'], default: 'false' }] },
  { id: 'xor', name: 'XOR shifr', description: 'XOR shifrlash', method: 'POST', path: '/api/tools/encrypt/xor', category: 'Security', emoji: '🔑', params: [{ name: 'text', type: 'textarea' }, { name: 'key', type: 'text', default: 'secret' }] },
  { id: 'sha256', name: 'SHA-256', description: 'SHA-256 xesh', method: 'POST', path: '/api/tools/hash/md5', category: 'Security', emoji: '#️⃣', params: [{ name: 'text', type: 'textarea' }] },
  { id: 'rnd-bytes', name: 'Tasodifiy bayt', description: 'Kriptografik baytlar', method: 'GET', path: '/api/tools/random-bytes', category: 'Security', emoji: '🎲', params: [{ name: 'count', type: 'number', default: '32' }] },
  { id: 'jwt-sign', name: 'JWT yaratish', description: 'Demo JWT token', method: 'GET', path: '/api/tools/jwt/sign', category: 'Security', emoji: '🎫', params: [{ name: 'payload', type: 'text', default: '{"user":"admin"}' }] },

  // Productivity (10)
  { id: 'todo-add', name: 'Todo qo\'shish', description: 'Yangi vazifa yaratish', method: 'POST', path: '/api/tools/todo/add', category: 'Productivity', emoji: '✅', params: [{ name: 'text', type: 'text' }, { name: 'priority', type: 'select', options: ['low', 'medium', 'high'], default: 'medium' }] },
  { id: 'todo-list', name: 'Todo ro\'yxati', description: 'Barcha vazifalar', method: 'GET', path: '/api/tools/todo/list', category: 'Productivity', emoji: '📋' },
  { id: 'note', name: 'Eslatma', description: 'Yangi eslatma yaratish', method: 'POST', path: '/api/tools/note/create', category: 'Productivity', emoji: '📝', params: [{ name: 'title', type: 'text' }, { name: 'content', type: 'textarea' }] },
  { id: 'habit', name: 'Odat kuzatish', description: 'Odatni belgilash', method: 'POST', path: '/api/tools/habit/track', category: 'Productivity', emoji: '🎯', params: [{ name: 'habit', type: 'text' }] },
  { id: 'pomo', name: 'Pomodoro 25min', description: '25 daqiqa ish', method: 'POST', path: '/api/tools/pomodoro/start', category: 'Productivity', emoji: '🍅' },
  { id: 'pomo-b', name: 'Pomodoro 5min', description: '5 daqiqa tanaffus', method: 'POST', path: '/api/tools/pomodoro/break', category: 'Productivity', emoji: '☕' },
  { id: 'pomo-l', name: 'Pomodoro 15min', description: '15 daqiqa uzoq tanaffus', method: 'POST', path: '/api/tools/pomodoro/long-break', category: 'Productivity', emoji: '🌴' },
  { id: 'bookmark', name: 'Xatcho\'p', description: 'Xatcho\'p saqlash', method: 'POST', path: '/api/tools/bookmark/add', category: 'Productivity', emoji: '🔖', params: [{ name: 'url', type: 'text' }, { name: 'title', type: 'text' }] },
  { id: 'achieve', name: 'Yutuqlar', description: 'Barcha yutuqlar', method: 'GET', path: '/api/tools/achievements', category: 'Productivity', emoji: '🏆' },
  { id: 'leader', name: 'Yetakchilar', description: 'Top foydalanuvchilar', method: 'GET', path: '/api/tools/leaderboard', category: 'Productivity', emoji: '👑', params: [{ name: 'type', type: 'select', options: ['xp', 'tokens', 'posts', 'comments'], default: 'xp' }] },

  // Converters (5)
  { id: 'md2html', name: 'MD → HTML', description: 'Markdown dan HTML ga', method: 'POST', path: '/api/tools/convert/markdown', category: 'Converters', emoji: '🔄', params: [{ name: 'markdown', type: 'textarea' }] },
  { id: 'csv2json', name: 'CSV → JSON', description: 'CSV dan JSON ga', method: 'POST', path: '/api/tools/convert/csv/json', category: 'Converters', emoji: '📊', params: [{ name: 'csv', type: 'textarea' }] },
  { id: 'json2csv', name: 'JSON → CSV', description: 'JSON dan CSV ga', method: 'POST', path: '/api/tools/convert/json/csv', category: 'Converters', emoji: '📈', params: [{ name: 'json', type: 'textarea' }] },
  { id: 'json2yaml', name: 'JSON → YAML', description: 'JSON dan YAML ga', method: 'POST', path: '/api/tools/convert/yaml', category: 'Converters', emoji: '📄', params: [{ name: 'json', type: 'textarea' }] },
  { id: 'color-conv', name: 'HEX → RGB/HSL', description: 'Rang formatlari', method: 'POST', path: '/api/tools/convert/color', category: 'Converters', emoji: '🎨', params: [{ name: 'hex', type: 'text', default: '#3A86FF' }] },

  // Reference (5)
  { id: 'dict', name: 'Lug\'at', description: 'So\'z ma\'nosi (English)', method: 'GET', path: '/api/tools/dictionary/:word', category: 'Reference', emoji: '📖', params: [{ name: 'word', type: 'text', default: 'hello' }] },
  { id: 'rhyme', name: 'Qofiy', description: 'Qofiy so\'zlar', method: 'GET', path: '/api/tools/rhyme/:word', category: 'Reference', emoji: '🎵', params: [{ name: 'word', type: 'text', default: 'time' }] },
  { id: 'syn', name: 'Sinonim', description: 'Sinonim so\'zlar', method: 'GET', path: '/api/tools/synonym/:word', category: 'Reference', emoji: '🔁', params: [{ name: 'word', type: 'text', default: 'happy' }] },
  { id: 'ant', name: 'Antonim', description: 'Antonim so\'zlar', method: 'GET', path: '/api/tools/antonym/:word', category: 'Reference', emoji: '↔️', params: [{ name: 'word', type: 'text', default: 'happy' }] },
  { id: 'rnd-word', name: 'Random so\'z', description: 'Tasodifiy so\'zlar', method: 'GET', path: '/api/tools/random-word', category: 'Reference', emoji: '🔤', params: [{ name: 'count', type: 'number', default: '5' }] },

  // Meta (5)
  { id: 'list', name: 'Barcha toollar', description: '120+ tool ro\'yxati', method: 'GET', path: '/api/tools/list', category: 'Meta', emoji: '📋' },
  { id: 'stats', name: 'Statistika', description: 'Server statistikasi', method: 'GET', path: '/api/tools/stats', category: 'Meta', emoji: '📊' },
  { id: 'health', name: 'Salomatlik', description: 'Server holati', method: 'GET', path: '/api/tools/health', category: 'Meta', emoji: '💚' },
  { id: 'ver', name: 'Versiya', description: 'Versiya ma\'lumotlari', method: 'GET', path: '/api/tools/version', category: 'Meta', emoji: '🏷' },
  { id: 'docs', name: 'API docs', description: 'Interaktiv HTML hujjat', method: 'GET', path: '/api/tools/docs', category: 'Meta', emoji: '📚' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.00o.uz';

export default function ToolsPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const filteredTools = useMemo(() => {
    return TOOLS.filter(t => {
      const matchQ = !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()) || t.path.toLowerCase().includes(query.toLowerCase());
      const matchC = activeCategory === 'All' || t.category === activeCategory;
      return matchQ && matchC;
    });
  }, [query, activeCategory]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { All: TOOLS.length };
    for (const t of TOOLS) stats[t.category] = (stats[t.category] || 0) + 1;
    return stats;
  }, []);

  useEffect(() => {
    if (activeTool) {
      const initial: Record<string, string> = {};
      activeTool.params?.forEach(p => { initial[p.name] = p.default || ''; });
      setParams(initial);
      setResult(null);
    }
  }, [activeTool]);

  const runTool = async () => {
    if (!activeTool) return;
    setLoading(true);
    setResult(null);
    try {
      let url = activeTool.path;
      const queryParams: string[] = [];
      const body: Record<string, any> = {};
      activeTool.params?.forEach(p => {
        const v = params[p.name];
        if (v && activeTool.method === 'GET' && !activeTool.path.includes(':' + p.name)) queryParams.push(`${p.name}=${encodeURIComponent(v)}`);
        if (v && (activeTool.method === 'POST' || activeTool.path.includes(':' + p.name))) {
          if (activeTool.path.includes(':' + p.name)) url = url.replace(':' + p.name, encodeURIComponent(v));
          else body[p.name] = v;
        }
      });
      // Path parameters (e.g. :id, :symbol)
      for (const key of Object.keys(params)) {
        if (url.includes(':' + key)) url = url.replace(':' + key, encodeURIComponent(params[key]));
      }
      const finalUrl = url + (queryParams.length ? (url.includes('?') ? '&' : '?') + queryParams.join('&') : '');
      const res = await fetch(API_BASE + finalUrl, {
        method: activeTool.method,
        headers: activeTool.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: activeTool.method === 'POST' ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setResult(data);
      setRecent(prev => [activeTool.id, ...prev.filter(x => x !== activeTool.id)].slice(0, 8));
    } catch (e: any) {
      setResult({ error: e.message || 'Request failed' });
    }
    setLoading(false);
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const quickTools = ['weather', 'translate', 'chat', 'currency', 'uuid', 'password', 'qr', 'meme', 'joke', 'countries'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 mb-4">
            <Zap className="h-4 w-4 text-pink-400" />
            <span className="text-sm font-medium">120+ ishlaydigan funksiya</span>
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            🛠️ 00o.uz Tools
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            O'zbek tilidagi eng katta onlayn platforma — 18 kategoriya, 120+ bepul tool. Real API integratsiyalari bilan.
          </p>
        </div>

        {/* QUICK TOOLS */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {quickTools.map(id => {
            const tool = TOOLS.find(t => t.id === id);
            if (!tool) return null;
            return (
              <button
                key={id}
                onClick={() => setActiveTool(tool)}
                className="px-4 py-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-sm font-medium transition flex items-center gap-2"
              >
                <span>{tool.emoji}</span>
                <span>{tool.name}</span>
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="🔍 120+ tool ichidan qidiring... (AI, weather, crypto, joke, uuid, qr...)"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-base"
          />
        </div>

        {/* CATEGORIES */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(categoryStats).map(([cat, count]) => {
            const meta = cat === 'All' ? null : CATEGORIES[cat];
            const Icon = meta?.icon;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 border border-slate-700/50'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{cat}</span>
                <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">{count}</span>
              </button>
            );
          })}
        </div>

        {/* TOOLS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredTools.map(tool => {
            const meta = CATEGORIES[tool.category];
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool)}
                className="group relative p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 hover:border-violet-500/50 text-left transition-all hover:scale-105 hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meta?.gradient || 'from-slate-500/20 to-slate-500/20'} opacity-0 group-hover:opacity-100 transition`} />
                <div className="relative">
                  <div className="text-3xl mb-2">{tool.emoji}</div>
                  <div className="font-bold text-sm mb-1 line-clamp-1">{tool.name}</div>
                  <div className="text-xs text-slate-400 line-clamp-2">{tool.description}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${tool.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {tool.method}
                    </span>
                    <span className="text-[10px] text-slate-500">{tool.category}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-slate-400">Hech narsa topilmadi. Boshqa so\'z bilan qidiring.</p>
          </div>
        )}

        {/* TOOL DETAIL MODAL */}
        {activeTool && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setActiveTool(null)}>
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className={`p-6 bg-gradient-to-br ${CATEGORIES[activeTool.category]?.gradient || 'from-slate-500/20 to-slate-500/20'} border-b border-slate-700`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{activeTool.emoji}</div>
                    <div>
                      <h2 className="text-2xl font-black">{activeTool.name}</h2>
                      <p className="text-sm text-slate-300">{activeTool.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${activeTool.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {activeTool.method}
                        </span>
                        <code className="text-xs px-2 py-1 rounded bg-black/30 text-slate-300">{activeTool.path}</code>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTool(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {activeTool.params && activeTool.params.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400">⚙️ Parametrlar</h3>
                    {activeTool.params.map(p => (
                      <div key={p.name}>
                        <label className="text-xs text-slate-400 mb-1 block">{p.name}{p.default ? ` (default: ${p.default})` : ''}</label>
                        {p.type === 'textarea' ? (
                          <textarea
                            value={params[p.name] || ''}
                            onChange={e => setParams({ ...params, [p.name]: e.target.value })}
                            placeholder={p.placeholder}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        ) : p.type === 'select' ? (
                          <select
                            value={params[p.name] || ''}
                            onChange={e => setParams({ ...params, [p.name]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          >
                            {p.options?.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={p.type}
                            value={params[p.name] || ''}
                            onChange={e => setParams({ ...params, [p.name]: e.target.value })}
                            placeholder={p.placeholder || p.default}
                            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={runTool}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:opacity-50 font-bold text-white flex items-center justify-center gap-2 transition"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...</> : <><Zap className="h-4 w-4" /> Ishga tushirish</>}
                </button>

                {result && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400" /> Natija
                      </h3>
                      <button onClick={copyResult} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copied ? <><Check className="h-3 w-3" /> Nusxalandi</> : <><Copy className="h-3 w-3" /> Nusxalash</>}
                      </button>
                    </div>
                    <pre className="p-4 rounded-lg bg-black/50 border border-slate-700 text-xs overflow-x-auto max-h-96 overflow-y-auto">
                      <code className="text-emerald-300">{JSON.stringify(result, null, 2)}</code>
                    </pre>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                  <span>API: <code className="text-slate-400">{API_BASE + activeTool.path}</code></span>
                  <a href={`${API_BASE}${activeTool.path}`} target="_blank" className="text-violet-400 hover:text-violet-300 flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> To\'g\'ridan-to\'g\'ri
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>🚀 00o.uz — O\'zbek tilidagi eng katta onlayn platforma | 120+ tools | 18 kategoriya</p>
          <p className="mt-2">Powered by Next.js 15 + Fastify + 30+ real APIs</p>
        </div>
      </div>
    </div>
  );
}
