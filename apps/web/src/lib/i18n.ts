// i18n - Internationalization
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'uz' | 'ru' | 'en';

const translations = {
  uz: {
    dashboard: 'Boshqaruv paneli', startups: 'Startaplar', marketplace: 'Marketplace', jobs: 'Ish',
    investors: 'Investorlar', chats: 'Xabarlar', feed: 'Feed', ai: 'AI Yordamchi', profile: 'Profil',
    settings: 'Sozlamalar', tokens: 'Tokenlar', admin: 'Admin',
    home: 'Bosh sahifa', login: 'Kirish', register: 'Ro\'yxatdan o\'tish', logout: 'Chiqish',
    save: 'Saqlash', cancel: 'Bekor qilish', delete: 'O\'chirish', edit: 'Tahrirlash', create: 'Yaratish',
    send: 'Yuborish', search: 'Qidirish', loading: 'Yuklanmoqda...', error: 'Xatolik', success: 'Muvaffaqiyat',
    follow: 'Obuna bo\'lish', following: 'Obuna bo\'lingan', like: 'Yoqtirish', liked: 'Yoqtirilgan',
    share: 'Ulashish', comment: 'Izoh', apply: 'Apply', buy: 'Sotib olish', sell: 'Sotish',
    heroTitle: 'O\'zbekistondagi #1 AI Startup Hub',
    heroDesc: 'AI yordamchi, startup ekotizimi va professional xizmatlar — barchasi bir joyda',
    getStarted: 'Boshlash', learnMore: 'Batafsil', welcome: 'Xush kelibsiz',
  },
  ru: {
    dashboard: 'Панель', startups: 'Стартапы', marketplace: 'Маркетплейс', jobs: 'Работа',
    investors: 'Инвесторы', chats: 'Сообщения', feed: 'Лента', ai: 'AI', profile: 'Профиль',
    settings: 'Настройки', tokens: 'Токены', admin: 'Админ',
    home: 'Главная', login: 'Войти', register: 'Регистрация', logout: 'Выйти',
    save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', edit: 'Редактировать', create: 'Создать',
    send: 'Отправить', search: 'Поиск', loading: 'Загрузка...', error: 'Ошибка', success: 'Успех',
    follow: 'Подписаться', following: 'Подписан', like: 'Нравится', liked: 'Понравилось',
    share: 'Поделиться', comment: 'Комментарий', apply: 'Откликнуться', buy: 'Купить', sell: 'Продать',
    heroTitle: '#1 AI Startup Hub в Узбекистане',
    heroDesc: 'AI помощник, стартап экосистема и профессиональные услуги — всё в одном месте',
    getStarted: 'Начать', learnMore: 'Подробнее', welcome: 'Добро пожаловать',
  },
  en: {
    dashboard: 'Dashboard', startups: 'Startups', marketplace: 'Marketplace', jobs: 'Jobs',
    investors: 'Investors', chats: 'Messages', feed: 'Feed', ai: 'AI Assistant', profile: 'Profile',
    settings: 'Settings', tokens: 'Tokens', admin: 'Admin',
    home: 'Home', login: 'Login', register: 'Sign up', logout: 'Logout',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', create: 'Create',
    send: 'Send', search: 'Search', loading: 'Loading...', error: 'Error', success: 'Success',
    follow: 'Follow', following: 'Following', like: 'Like', liked: 'Liked',
    share: 'Share', comment: 'Comment', apply: 'Apply', buy: 'Buy', sell: 'Sell',
    heroTitle: 'Uzbekistan\'s #1 AI Startup Hub',
    heroDesc: 'AI assistant, startup ecosystem, and professional services — all in one place',
    getStarted: 'Get Started', learnMore: 'Learn More', welcome: 'Welcome',
  },
};

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof translations.uz) => string;
}

export const useI18n = create<I18nState>()(
  persist((set, get) => ({
    lang: 'uz',
    setLang: (l: Lang) => set({ lang: l }),
    t: (key) => (translations[get().lang] as any)?.[key] || (translations.uz as any)[key] || key,
  }), { name: 'i18n' })
);

export const languages: { code: Lang; flag: string; name: string }[] = [
  { code: 'uz', flag: '🇺🇿', name: 'O\'zbek' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
];
