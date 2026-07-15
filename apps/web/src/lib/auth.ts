// 00o.uz - Auth store (Zustand-like simple version)
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';

interface User {
  id: string;
  email?: string;
  phone?: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: 'USER' | 'PREMIUM' | 'BUSINESS' | 'ADMIN' | 'SUPER_ADMIN';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.login(data);
          if (res.require2FA) throw new Error('2FA_REQUIRED');
          api.setToken(res.accessToken);
          api.setRefreshToken(res.refreshToken);
          set({ user: res.user, isAuthenticated: true, isLoading: false });
        } catch (err) { set({ isLoading: false }); throw err; }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.register(data);
          api.setToken(res.accessToken);
          api.setRefreshToken(res.refreshToken);
          set({ user: res.user, isAuthenticated: true, isLoading: false });
        } catch (err) { set({ isLoading: false }); throw err; }
      },

      logout: async () => {
        try { await api.logout(); } catch {}
        api.setToken(null);
        api.setRefreshToken(null);
        set({ user: null, isAuthenticated: false });
      },

      loadUser: async () => {
        if (!api['accessToken'] && typeof window !== 'undefined') {
          const t = localStorage.getItem('oo_access');
          if (t) api.setToken(t);
        }
        if (!localStorage.getItem('oo_access') && typeof window !== 'undefined') {
          set({ isAuthenticated: false, user: null });
          return;
        }
        try {
          const res = await api.getMe();
          set({ user: res.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: (data) => set({ user: { ...get().user, ...data } as User }),
    }),
    { name: 'oo-auth' }
  )
);
