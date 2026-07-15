'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  verified: boolean;
  premium: boolean;
  tokens: number;
  xp: number;
  level: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; username: string; firstName?: string; lastName?: string }) => Promise<void>;
  loginWithTelegram: (initData: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshTokens: () => Promise<number>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res: any = await api.auth.login(email, password);
          const data = res.data || res;
          api.setToken(data.access_token);
          if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', data.refresh_token);
          }
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (e: any) {
          const msg = e.response?.data?.message || e.message || 'Login xatosi';
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res: any = await api.auth.register(data);
          const result = res.data || res;
          api.setToken(result.access_token);
          if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', result.refresh_token);
          }
          set({ user: result.user, isAuthenticated: true, isLoading: false });
        } catch (e: any) {
          const msg = e.response?.data?.message || e.message || 'Ro\'yxatdan o\'tish xatosi';
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      loginWithTelegram: async (initData) => {
        set({ isLoading: true, error: null });
        try {
          const res: any = await api.auth.telegram(initData);
          const data = res.data || res;
          api.setToken(data.access_token);
          if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', data.refresh_token);
          }
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (e: any) {
          const msg = e.response?.data?.message || 'Telegram login xatosi';
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } catch {}
        api.clear();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('accessToken');
        }
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        if (!get().isAuthenticated && !localStorage.getItem('accessToken')) {
          set({ isInitialized: true });
          return;
        }
        try {
          const res: any = await api.auth.me();
          const user = res.data || res;
          set({ user, isAuthenticated: true, isInitialized: true });
        } catch {
          set({ isInitialized: true });
        }
      },

      updateProfile: async (data) => {
        const res: any = await api.users.update(data);
        const user = res.data || res;
        set({ user });
      },

      refreshTokens: async () => {
        if (typeof window === 'undefined') return 0;
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) return 0;
        try {
          const res: any = await api.auth.refresh(refresh);
          const data = res.data || res;
          api.setToken(data.access_token);
          localStorage.setItem('refreshToken', data.refresh_token);
          return Date.now();
        } catch {
          return 0;
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
