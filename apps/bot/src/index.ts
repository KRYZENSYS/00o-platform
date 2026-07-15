// 00o.uz - Telegram Bot (Telegraf)
import { Telegraf, Scenes, session, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import { prisma } from './db';
import { registerScene } from './scenes/register';
import { todoScene } from './scenes/todo';
import { noteScene } from './scenes/note';
import { habitScene } from './scenes/habit';
import { postScene } from './scenes/post';
import { financeScene } from './scenes/finance';
import { handlers } from './handlers';
import { stats } from './middleware/stats';
import { logger } from './utils/logger';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://00o.uz';
const API_URL = process.env.API_URL || 'http://localhost:4000/api/v1';

if (BOT_TOKEN === 'YOUR_BOT_TOKEN') {
  console.warn('⚠️  BOT_TOKEN not set. Bot will not work.');
}

const bot = new Telegraf<Scenes.WizardContext>(BOT_TOKEN);

// Stage (scenes)
const stage = new Scenes.Stage<Scenes.WizardContext>([
  registerScene, todoScene, noteScene, habitScene, postScene, financeScene,
]);
bot.use(session());
bot.use(stage.middleware());
bot.use(stats);

// ==================== COMMANDS ====================

bot.start(async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  let user = await prisma.user.findFirst({ where: { telegramId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        username: `tg_${telegramId}`,
        displayName: ctx.from?.first_name + (ctx.from?.last_name ? ' ' + ctx.from.last_name : ''),
        avatar: ctx.from?.photo_url,
      },
    });
  }

  await ctx.replyWithPhoto(
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' + telegramId,
    {
      caption:
        `🎉 *Xush kelibsiz, ${user.displayName}!*\n\n` +
        `00o.uz — O'zbek platformasining rasmiy boti.\n` +
        `50+ foydali ilova, 1 ta bot.\n\n` +
        `Quyidagilardan birini tanlang:`,
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['📋 Vazifalarim', '📝 Eslatmalar'],
        ['🎯 Odatlarim', '💰 Moliyam'],
        ['📊 Statistika', '🌐 Ilova'],
        ['⚙️ Sozlamalar', '❓ Yordam'],
      ]).resize(),
    }
  );
});

// Main menu commands
bot.hears('📋 Vazifalarim', handlers.todo.list);
bot.hears('📝 Eslatmalar', handlers.note.list);
bot.hears('🎯 Odatlarim', handlers.habit.list);
bot.hears('💰 Moliyam', handlers.finance.list);
bot.hears('📊 Statistika', handlers.stats);
bot.hears('🌐 Ilova', (ctx) => ctx.reply('🌐 Web ilovani ochish:', Markup.keyboard([
  [Markup.button.webApp('🚀 00o.uz', WEBAPP_URL)],
  ['🔙 Orqaga'],
]).resize()));
bot.hears('⚙️ Sozlamalar', handlers.settings);
bot.hears('❓ Yordam', handlers.help);

// Slash commands
bot.command('todo', (ctx) => ctx.scene.enter('todo'));
bot.command('note', (ctx) => ctx.scene.enter('note'));
bot.command('habit', (ctx) => ctx.scene.enter('habit'));
bot.command('post', (ctx) => ctx.scene.enter('post'));
bot.command('finance', (ctx) => ctx.scene.enter('finance'));
bot.command('stats', handlers.stats);
bot.command('feed', handlers.post.feed);
bot.command('search', handlers.search);
bot.command('export', handlers.export);
bot.command('remind', handlers.remind);
bot.command('quote', handlers.quote);
bot.command('weather', handlers.weather);
bot.command('currency', handlers.currency);
bot.command('calc', handlers.calc);
bot.command('timer', handlers.timer);
bot.command('translate', handlers.translate);
bot.command('qr', handlers.qr);
bot.command('shorten', handlers.shorten);
bot.command('meme', handlers.meme);
bot.command('joke', handlers.joke);
bot.command('fact', handlers.fact);
bot.command('riddle', handlers.riddle);
bot.command('horoscope', handlers.horoscope);
bot.command('ai', handlers.ai);
bot.command('settings', handlers.settings);
bot.command('help', handlers.help);
bot.command('profile', handlers.profile);
bot.command('premium', handlers.premium);
bot.command('support', handlers.support);
bot.command('feedback', handlers.feedback);
bot.command('invite', handlers.invite);

// Quick add
bot.hears(/^\/add (.+)/, async (ctx) => {
  const text = ctx.match[1];
  const telegramId = ctx.from.id.toString();
  const user = await prisma.user.findFirst({ where: { telegramId } });
  if (!user) return ctx.reply('Avval /start');

  const [type, ...rest] = text.split(' ');
  const content = rest.join(' ');

  switch (type) {
    case 'todo':
      await prisma.todo.create({ data: { userId: user.id, title: content, priority: 'MEDIUM' } });
      return ctx.reply(`✅ Qo'shildi: ${content}`);
    case 'note':
      await prisma.note.create({ data: { userId: user.id, title: 'Tezkor', content, color: '#8b5cf6' } });
      return ctx.reply(`📝 Saqlandi`);
    case 'habit':
      await prisma.habit.create({ data: { userId: user.id, name: content, icon: '✅', color: '#8b5cf6', frequency: 'DAILY' } });
      return ctx.reply(`🎯 Yaratildi: ${content}`);
    case 'expense':
      await prisma.transaction.create({ data: { userId: user.id, amount: +content.split(' ')[0] || 0, type: 'EXPENSE', category: 'Boshqa', note: content.split(' ').slice(1).join(' ') } });
      return ctx.reply(`💸 Xarajat: ${content}`);
    case 'income':
      await prisma.transaction.create({ data: { userId: user.id, amount: +content.split(' ')[0] || 0, type: 'INCOME', category: 'Boshqa', note: content.split(' ').slice(1).join(' ') } });
      return ctx.reply(`💰 Daromad: ${content}`);
    default:
      return ctx.reply('Format: /add todo/note/habit/expense/income [matn]');
  }
});

// WebApp data handler
bot.on(message('web_app_data'), async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    logger.info('WebApp data:', data);
    await ctx.reply('✅ WebApp dan ma\'lumot qabul qilindi');
  } catch (err) {
    logger.error('WebApp error:', err);
  }
});

// Inline mode
bot.inlineQuery(/^(todo|note|habit) (.+)/, async (ctx) => {
  const [, type, text] = ctx.match;
  const results = [{
    type: 'article' as const,
    id: ctx.inlineQuery.id,
    title: `Yangi ${type}: ${text}`,
    input_message_content: { message_text: `📌 ${type.toUpperCase()}: ${text}` },
  }];
  await ctx.answerInlineQuery(results);
});

// Launch
bot.launch().then(() => logger.info('🤖 Bot started')).catch((err) => logger.error('Bot error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
