// Zustand auth store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: number; email?: string; username: string; firstName: string; lastName?: string;
  avatar?: string; bio?: string; tokens?: number; xp?: number; level?: string;
  isPremium?: boolean; isVerified?: boolean; role?: string;
  followersCount?: number; followingCount?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (u: User | null) => void;
  updateUser: (u: Partial<User>) => void;
  logout: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    setUser: (u) => {
      set({ user: u, isAuthenticated: !!u });
      if (u) localStorage.setItem('user', JSON.stringify(u));
      else localStorage.removeItem('user');
    },
    updateUser: (updates) => {
      const current = get().user;
      if (current) {
        const updated = { ...current, ...updates };
        set({ user: updated });
        localStorage.setItem('user', JSON.stringify(updated));
      }
    },
    logout: async () => {
      try {
        const { default: api } = await import('@/lib/api');
        await api.auth.logout();
      } catch (e) { /* ignore */ }
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    },
    init: () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try { set({ user: JSON.parse(stored), isAuthenticated: true }); } catch (e) { /* ignore */ }
        }
      }
    },
  }), {
    name: 'auth',
    partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
  })
);
