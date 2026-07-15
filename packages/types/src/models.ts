export interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'USER' | 'PREMIUM' | 'ADMIN';
  isPremium: boolean;
  isVerified: boolean;
  tokenBalance: number;
  createdAt: string;
}

export interface Startup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry?: string;
  stage?: string;
  ownerId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Chat {
  id: string;
  type: 'DIRECT' | 'GROUP' | 'CHANNEL';
  name?: string;
  lastMessage?: Message;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
}
