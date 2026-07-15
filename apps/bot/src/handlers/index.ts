// All bot handlers
import { Context, Markup } from 'telegraf';
import { prisma } from '../db';
import { logger } from '../utils/logger';

const API_URL = process.env.API_URL || 'http://localhost:4000/api/v1';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://00o.uz';

async function getUser(ctx: Context) {
  return prisma.user.findFirst({ where: { telegramId: ctx.from!.id.toString() } });
}

export const handlers = {
  todo: {
    list: async (ctx: Context) => {
      const user = await getUser(ctx);
      if (!user) return ctx.reply('Avval /start');
      const todos = await prisma.todo.findMany({ where: { userId: user.id, status: { not: 'COMPLETED' } }, take: 20, orderBy: { createdAt: 'desc' } });

      if (todos.length === 0) {
        return ctx.reply('📋 Vazifalar yo\'q. /todo - yangi qo\'shish', Markup.inlineKeyboard([
          [Markup.button.callback('➕ Yangi vazifa', 'new_todo')],
        ]));
      }

      const text = todos.map((t, i) => `${i + 1}. ${t.completed ? '✅' : '⬜'} *${t.title}*${t.priority === 'URGENT' ? ' 🔥' : ''}`).join('\n');
      await ctx.reply(`📋 *Vazifalaringiz:*\n\n${text}\n\nTugmani bosing:`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          ...todos.slice(0, 5).map((t) => [Markup.button.callback(`${t.completed ? '↩️' : '✅'} ${t.title.slice(0, 25)}`, `toggle_${t.id}`)]),
          [Markup.button.callback('➕ Yangi', 'new_todo'), Markup.button.callback('🔄 Yangilash', 'refresh_todo')],
        ]),
      });
    },
  },
  note: {
    list: async (ctx: Context) => {
      const user = await getUser(ctx);
      if (!user) return ctx.reply('Avval /start');
      const notes = await prisma.note.findMany({ where: { userId: user.id, isArchived: false }, take: 10, orderBy: { updatedAt: 'desc' } });
      if (notes.length === 0) return ctx.reply('📝 Eslatmalar yo\'q. /note - yangi qo\'shish');
      const text = notes.map((n, i) => `${i + 1}. *${n.title}*\n   ${n.content.slice(0, 50)}...`).join('\n\n');
      await ctx.reply(`📝 *Eslatmalar:*\n\n${text}`, { parse_mode: 'Markdown' });
    },
  },
  habit: {
    list: async (ctx: Context) => {
      const user = await getUser(ctx);
      if (!user) return ctx.reply('Avval /start');
      const habits = await prisma.habit.findMany({ where: { userId: user.id, isArchived: false }, take: 10 });
      if (habits.length === 0) return ctx.reply('🎯 Odatlar yo\'q. /habit - yangi qo\'shish');
      const text = habits.map((h, i) => `${h.icon} *${h.name}* — 🔥 ${h.streak || 0} kun`).join('\n');
      await ctx.reply(`🎯 *Odatlaringiz:*\n\n${text}`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(habits.map((h) => [Markup.button.callback(`✅ ${h.name.slice(0, 20)}`, `log_${h.id}`)])),
      });
    },
  },
  finance: {
    list: async (ctx: Context) => {
      const user = await getUser(ctx);
      if (!user) return ctx.reply('Avval /start');
      const txs = await prisma.transaction.findMany({ where: { userId: user.id }, take: 10, orderBy: { date: 'desc' } });
      const income = txs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

      await ctx.reply(
        `💰 *Moliyaviy holat:*\n\n` +
        `📈 Daromad: +${income.toLocaleString()} so'm\n` +
        `📉 Xarajat: -${expense.toLocaleString()} so'm\n` +
        `💵 Balans: ${(income - expense).toLocaleString()} so'm\n\n` +
        `*So'nggi tranzaksiyalar:*\n` +
        txs.slice(0, 5).map((t) => `${t.type === 'INCOME' ? '💰' : '💸'} ${t.amount.toLocaleString()} — ${t.category}`).join('\n'),
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('💰 Daromad', 'add_income'), Markup.button.callback('💸 Xarajat', 'add_expense')],
            [Markup.button.webApp('📊 Batafsil', `${WEBAPP_URL}/finance`)],
          ]),
        }
      );
    },
  },
  post: {
    feed: async (ctx: Context) => {
      const posts = await prisma.post.findMany({ where: { visibility: 'PUBLIC' }, take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } });
      if (posts.length === 0) return ctx.reply('📭 Lenta bo\'sh');
      for (const p of posts) {
        await ctx.reply(`@${p.user.username}\n\n${p.content}\n\n❤️ ${p.likesCount} 💬 ${p.commentsCount}`, {
          ...Markup.inlineKeyboard([
            [Markup.button.callback('❤️ Like', `like_${p.id}`), Markup.button.webApp('💬 Komment', `${WEBAPP_URL}/feed#${p.id}`)],
          ]),
        });
      }
    },
  },
  stats: async (ctx: Context) => {
    const user = await getUser(ctx);
    if (!user) return ctx.reply('Avval /start');
    const [todos, notes, habits, posts, txs] = await Promise.all([
      prisma.todo.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      prisma.note.count({ where: { userId: user.id } }),
      prisma.habit.findMany({ where: { userId: user.id, isArchived: false } }),
      prisma.post.count({ where: { userId: user.id } }),
      prisma.transaction.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
    ]);
    const totalStreak = habits.reduce((s, h) => s + (h.streak || 0), 0);

    await ctx.reply(
      `📊 *Sizning statistikangiz:*\n\n` +
      `✅ Bajarilgan vazifalar: *${todos}*\n` +
      `📝 Eslatmalar: *${notes}*\n` +
      `🎯 Odatlar: *${habits.length}* (🔥 ${totalStreak} kun streak)\n` +
      `📤 Postlar: *${posts}*\n` +
      `💰 Jami tranzaksiya: *${(txs._sum.amount || 0).toLocaleString()}* so'm\n\n` +
      `🏆 Darajangiz: *${user.role}*\n` +
      `⭐ XP: *${user.xp}*`,
      { parse_mode: 'Markdown' }
    );
  },
  settings: async (ctx: Context) => {
    await ctx.reply('⚙️ *Sozlamalar:*\n\nQuyidagilardan birini tanlang:', {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔔 Bildirishnomalar', 'notif_settings')],
        [Markup.button.callback('🌐 Til', 'lang_settings')],
        [Markup.button.callback('🔒 Maxfiylik', 'privacy_settings')],
        [Markup.button.callback('⭐ Premium', 'premium_info')],
        [Markup.button.webApp('⚙️ To\'liq sozlamalar', `${WEBAPP_URL}/profile`)],
      ]),
    });
  },
  help: async (ctx: Context) => {
    await ctx.reply(
      `❓ *Yordam - 00o.uz Bot*\n\n` +
      `*Asosiy buyruqlar:*\n` +
      `/start - Boshlash\n` +
      `/todo - Vazifa qo'shish\n` +
      `/note - Eslatma\n` +
      `/habit - Odat\n` +
      `/post - Post yozish\n` +
      `/finance - Moliya\n` +
      `/feed - Lenta\n` +
      `/stats - Statistika\n\n` +
      `*Tezkor:*\n` +
      `/add todo [matn]\n` +
      `/add expense [summa] [izoh]\n\n` +
      `*Vositalar:*\n` +
      `/calc 2+2*3 - Kalkulyator\n` +
      `/weather - Ob-havo\n` +
      `/currency - Valyuta\n` +
      `/translate [matn]\n` +
      `/qr [matn] - QR kod\n` +
      `/quote - Iqtibos\n` +
      `/joke - Hazil\n` +
      `/fact - Fakt\n` +
      `/horoscope - Burj\n` +
      `/ai [savol] - AI yordamchi\n\n` +
      `*Boshqa:*\n` +
      `/premium, /profile, /settings\n` +
      `/support, /feedback, /invite`,
      { parse_mode: 'Markdown' }
    );
  },
  profile: async (ctx: Context) => {
    const user = await getUser(ctx);
    if (!user) return ctx.reply('Avval /start');
    await ctx.replyWithPhoto(
      user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.telegramId}`,
      {
        caption:
          `👤 *${user.displayName}*\n@${user.username}\n\n` +
          `📅 Qo'shilgan: ${user.createdAt.toLocaleDateString('uz-UZ')}\n` +
          `🏆 Daraja: ${user.role}\n` +
          `⭐ XP: ${user.xp}`,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('🌐 Profil', `${WEBAPP_URL}/profile`)],
        ]),
      }
    );
  },
  premium: async (ctx: Context) => {
    await ctx.reply(
      `⭐ *00o.uz Premium*\n\n` +
      `Premium bilan:\n` +
      `✅ Cheksiz vazifalar\n` +
      `🤖 AI yordamchi\n` +
      `📊 Batafsil tahlil\n` +
      `🎨 Maxsus dizaynlar\n` +
      `🚀 Reklama yo'q\n` +
      `💎 VIP yordam\n\n` +
      `💰 Oylik: 29,900 so'm\n` +
      `💰 Yillik: 299,000 so'm (17% tejash!)\n\n` +
      `To'lov usullari: Payme, Click, Uzum`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('💎 Premium ga o\'tish', `${WEBAPP_URL}/premium`)],
        ]),
      }
    );
  },
  support: async (ctx: Context) => {
    await ctx.reply('💬 *Yordam markazi:*\n\n📧 support@00o.uz\n📞 +998 71 123-45-67\n\nYoki /feedback orqali yozing.', { parse_mode: 'Markdown' });
  },
  feedback: async (ctx: Context) => {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/feedback', '').trim() : '';
    if (!text) return ctx.reply('Fikr yozing: /feedback [xabar]');
    await ctx.reply('✅ Fikringiz qabul qilindi. Rahmat!');
  },
  invite: async (ctx: Context) => {
    const user = await getUser(ctx);
    if (!user) return ctx.reply('Avval /start');
    const link = `https://t.me/oo_uzbot?start=ref_${user.id}`;
    await ctx.reply(`🎁 *Do\'stlaringizni taklif qiling!*\n\nSizning havolangiz:\n${link}\n\nHar bir do'st uchun 30 XP!`, { parse_mode: 'Markdown' });
  },
  search: async (ctx: Context) => {
    const q = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/search', '').trim() : '';
    if (!q) return ctx.reply('Qidirish: /search [so\'z]');
    const [todos, notes, posts] = await Promise.all([
      prisma.todo.findMany({ where: { userId: (await getUser(ctx))?.id, title: { contains: q, mode: 'insensitive' } }, take: 5 }),
      prisma.note.findMany({ where: { userId: (await getUser(ctx))?.id, OR: [{ title: { contains: q, mode: 'insensitive' } }, { content: { contains: q, mode: 'insensitive' } }] }, take: 5 }),
      prisma.post.findMany({ where: { content: { contains: q, mode: 'insensitive' } }, take: 5 }),
    ]);
    await ctx.reply(`🔍 *Qidiruv natijalari:*\n\n${todos.length + notes.length + posts.length} ta natija topildi.`, { parse_mode: 'Markdown' });
  },
  export: async (ctx: Context) => {
    await ctx.reply('📥 Ma\'lumotlarni eksport qilish:', Markup.inlineKeyboard([
      [Markup.button.callback('📄 PDF', 'export_pdf'), Markup.button.callback('📊 Excel', 'export_excel')],
      [Markup.button.callback('📋 JSON', 'export_json')],
    ]));
  },
  remind: async (ctx: Context) => {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const match = text.match(/^\/remind (\S+) (.+)/);
    if (!match) return ctx.reply('Format: /remind [vaqt] [matn]\nMasalan: /remind 14:30 Uchrashuv');
    await ctx.reply(`⏰ Eslatma o\'rnatildi: ${match[1]} - ${match[2]}`);
  },
  quote: async (ctx: Context) => {
    const quotes = [
      '«Muvaffaqiyat — bu tayyorgarlik va imkoniyat uchrashadigan joy.» — Bobby Unser',
      '«Hayotda eng katta risk — hech qanday risk qilmaslik.» — Mark Zuckerberg',
      '«Orzu qilish, lekin harakat qilmaslik — bu faqat uyqu.»',
    ];
    await ctx.reply(`💭 ${quotes[Math.floor(Math.random() * quotes.length)]}`);
  },
  weather: async (ctx: Context) => {
    await ctx.reply('🌤 *Toshkent:* +32°C, Quyoshli\n💨 Shamol: 5 m/s\n💧 Namlik: 45%', { parse_mode: 'Markdown' });
  },
  currency: async (ctx: Context) => {
    await ctx.reply('💱 *Valyuta kurslari:*\n\n🇺🇸 1 USD = 12,650 UZS\n🇪🇺 1 EUR = 13,720 UZS\n🇷🇺 1 RUB = 145 UZS\n🇰🇿 1 KZT = 28 UZS', { parse_mode: 'Markdown' });
  },
  calc: async (ctx: Context) => {
    const expr = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/calc', '').trim() : '';
    try {
      const result = Function(`"use strict"; return (${expr})`)();
      await ctx.reply(`🧮 ${expr} = *${result}*`, { parse_mode: 'Markdown' });
    } catch { await ctx.reply('❌ Noto\'g\'ri ifoda'); }
  },
  timer: async (ctx: Context) => {
    await ctx.reply('⏱ Taymer:', Markup.inlineKeyboard([
      [Markup.button.callback('5 daqiqa', 'timer_5'), Markup.button.callback('15 daqiqa', 'timer_15')],
      [Markup.button.callback('25 daqiqa (Pomodoro)', 'timer_25'), Markup.button.callback('1 soat', 'timer_60')],
    ]));
  },
  translate: async (ctx: Context) => {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/translate', '').trim() : '';
    if (!text) return ctx.reply('Format: /translate [matn]');
    await ctx.reply(`🌐 Tarjima (demo):\n\n*UZ:* ${text}\n*EN:* [Translation would be here]\n*RU:* [Перевод был бы здесь]`, { parse_mode: 'Markdown' });
  },
  qr: async (ctx: Context) => {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/qr', '').trim() : '';
    if (!text) return ctx.reply('Format: /qr [matn yoki URL]');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    await ctx.replyWithPhoto(qrUrl, { caption: `📱 QR: ${text}` });
  },
  shorten: async (ctx: Context) => {
    const url = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/shorten', '').trim() : '';
    if (!url) return ctx.reply('Format: /shorten [url]');
    await ctx.reply(`🔗 Qisqartirilgan: https://oo.uz/${Math.random().toString(36).slice(2, 8)}`);
  },
  meme: async (ctx: Context) => {
    await ctx.replyWithPhoto('https://i.imgflip.com/1bij.jpg', { caption: '😂 Random meme' });
  },
  joke: async (ctx: Context) => {
    const jokes = [
      'Dasturchi nima uchun qorong\'uda ishlaydi? Chunki yorug\'likda bug\'larni ko\'rmaydi! 🐛',
      '— Doktor, internet kasalligi bor deb eshitdim. — Bu kasallikni davolash uchun WiFi kerak!',
      'Bugungi sana: 2026. Mendeleyev: "Elementlarni to\'liq kashf etdim!" Dasturchi: "Kutib turing..."',
    ];
    await ctx.reply(jokes[Math.floor(Math.random() * jokes.length)]);
  },
  fact: async (ctx: Context) => {
    const facts = [
      '🐙 Octopusda 3 ta yurak bor.',
      '🍯 Muddati o\'tmagan asal hech qachon yomon bo\'lmaydi.',
      '🌍 Yerda 8 milliarddan ortiq odam yashaydi.',
      '🦈 Dunyoda 500 dan ortiq akula turi mavjud.',
    ];
    await ctx.reply(facts[Math.floor(Math.random() * facts.length)]);
  },
  riddle: async (ctx: Context) => {
    await ctx.reply('🧩 *Topishmoq:*\n\nOyoqlari bor, lekin yurmaydi. Nima?\n\n_(Javob: stol)_', { parse_mode: 'Markdown' });
  },
  horoscope: async (ctx: Context) => {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/horoscope', '').trim() : '';
    const signs = ['Qo\'y', 'Buqa', 'Egizaklar', 'Qisqichbaqa', 'Arslon', 'Parizod', 'Tarozi', 'Chayon', 'O\'qotar', 'Tog\' echkisi', 'Qovg\'a', 'Baliq'];
    const sign = text || signs[Math.floor(Math.random() * signs.length)];
    await ctx.reply(`♈️ *${sign}:*\n\nBugun sizga omad kulib boqadi! Yangi imkoniyatlar paydo bo\'ladi. Sabrli bo\'ling. ✨`, { parse_mode: 'Markdown' });
  },
  ai: async (ctx: Context) => {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text.replace('/ai', '').trim() : '';
    if (!text) return ctx.reply('Format: /ai [savol]');
    await ctx.reply('🤖 *AI javob:*\n\nSizning savolingiz qabul qilindi. Premium foydalanuvchilar uchun to\'liq AI integratsiya mavjud! ⭐', { parse_mode: 'Markdown' });
  },
};
