/**
 * API client — axios wrapper
 * Fixed: API_URL port corrected from 8000 (Python) to 4000 (Node.js Fastify)
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = this.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as any;
        if (error.response?.status === 401 && !original._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                original.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(original));
              });
            });
          }
          original._retry = true;
          this.isRefreshing = true;
          try {
            const refreshToken = Cookies.get('refresh_token');
            if (refreshToken) {
              const res = await this.client.post('/auth/refresh', { refreshToken });
              const newToken = res.data.data.token;
              this.setToken(newToken);
              this.refreshSubscribers.forEach((cb) => cb(newToken));
              this.refreshSubscribers = [];
              original.headers.Authorization = `Bearer ${newToken}`;
              return this.client(original);
            }
          } catch (e) {
            this.clearTokens();
            if (typeof window !== 'undefined') window.location.href = '/auth/login';
          } finally {
            this.isRefreshing = false;
          }
        }
        const message = (error.response?.data as any)?.message || error.message || 'Xatolik';
        if (error.response?.status !== 401 && error.response?.status !== 404) {
          toast.error(message);
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('access_token') || localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    Cookies.set('access_token', token, { expires: 7 });
    localStorage.setItem('token', token);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ===== Auth =====
  auth = {
    register: (data: any) => this.client.post('/auth/register', data).then(r => r.data),
    login: (email: string, password: string) => this.client.post('/auth/login', { email, password }).then(r => {
      this.setToken(r.data.data.token);
      localStorage.setItem('user', JSON.stringify(r.data.data.user));
      return r.data;
    }),
    logout: () => {
      this.clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
    },
    me: () => this.client.get('/auth/me').then(r => r.data),
    telegram: (data: any) => this.client.post('/auth/telegram', data).then(r => {
      this.setToken(r.data.data.token);
      return r.data;
    }),
  };

  // ===== Users =====
  users = {
    profile: (id: string) => this.client.get(`/users/${id}`).then(r => r.data),
    updateProfile: (data: any) => this.client.put('/users/me', data).then(r => r.data),
    uploadAvatar: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return this.client.post('/upload/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data);
    },
  };

  // ===== AI =====
  ai = {
    chat: (message: string, model = 'llama-3.3-70b-versatile') =>
      this.client.post('/ai/chat', { message, model }).then(r => r.data),
    models: () => this.client.get('/ai/models').then(r => r.data),
  };

  // ===== Chat (HTTP fallback) =====
  chat = {
    list: () => this.client.get('/chat').then(r => r.data),
    get: (id: string) => this.client.get(`/chat/${id}`).then(r => r.data),
    send: (chatId: string, content: string) =>
      this.client.post(`/chat/${chatId}/messages`, { content }).then(r => r.data),
  };

  // ===== Startups =====
  startups = {
    list: (params?: any) => this.client.get('/startups', { params }).then(r => r.data),
    get: (id: string) => this.client.get(`/startups/${id}`).then(r => r.data),
    create: (data: any) => this.client.post('/startups', data).then(r => r.data),
    update: (id: string, data: any) => this.client.put(`/startups/${id}`, data).then(r => r.data),
    delete: (id: string) => this.client.delete(`/startups/${id}`).then(r => r.data),
  };

  // ===== Marketplace =====
  marketplace = {
    list: (params?: any) => this.client.get('/marketplace', { params }).then(r => r.data),
    get: (id: string) => this.client.get(`/marketplace/${id}`).then(r => r.data),
    create: (data: any) => this.client.post('/marketplace', data).then(r => r.data),
  };

  // ===== Jobs =====
  jobs = {
    list: (params?: any) => this.client.get('/jobs', { params }).then(r => r.data),
    get: (id: string) => this.client.get(`/jobs/${id}`).then(r => r.data),
    apply: (id: string, data: any) => this.client.post(`/jobs/${id}/apply`, data).then(r => r.data),
  };

  // ===== Investors =====
  investors = {
    list: (params?: any) => this.client.get('/investors', { params }).then(r => r.data),
    get: (id: string) => this.client.get(`/investors/${id}`).then(r => r.data),
  };

  // ===== Feed =====
  feed = {
    list: (params?: any) => this.client.get('/feed', { params }).then(r => r.data),
    create: (data: any) => this.client.post('/feed', data).then(r => r.data),
    like: (id: string) => this.client.post(`/feed/${id}/like`).then(r => r.data),
  };

  // ===== Tokens =====
  tokens = {
    balance: () => this.client.get('/tokens/balance').then(r => r.data),
    history: () => this.client.get('/tokens/history').then(r => r.data),
    purchase: (amount: number) => this.client.post('/tokens/purchase', { amount }).then(r => r.data),
  };

  // ===== Subscriptions =====
  subscriptions = {
    plans: () => this.client.get('/subscriptions/plans').then(r => r.data),
    subscribe: (planId: string) => this.client.post('/subscriptions/subscribe', { planId }).then(r => r.data),
    current: () => this.client.get('/subscriptions/current').then(r => r.data),
  };

  // ===== Notifications =====
  notifications = {
    list: () => this.client.get('/notifications').then(r => r.data),
    markRead: (id: string) => this.client.put(`/notifications/${id}/read`).then(r => r.data),
  };

  // ===== Admin =====
  admin = {
    users: (params?: any) => this.client.get('/admin/users', { params }).then(r => r.data),
    banUser: (id: string) => this.client.post(`/admin/users/${id}/ban`).then(r => r.data),
    stats: () => this.client.get('/admin/stats').then(r => r.data),
  };
}

export const api = new ApiClient();
export const apiUrl = API_URL;
export const wsUrl = WS_URL;
export default api;
