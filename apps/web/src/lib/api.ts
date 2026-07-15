/** API client - axios wrapper */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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
    loginWithTelegram: (initData: string) => this.client.post('/auth/telegram', { initData }).then(r => {
      this.setToken(r.data.data.token);
      localStorage.setItem('user', JSON.stringify(r.data.data.user));
      return r.data;
    }),
    logout: () => this.client.post('/auth/logout').catch(() => {}).finally(() => this.clearTokens()),
    me: () => this.client.get('/auth/me').then(r => r.data),
    refresh: (refreshToken: string) => this.client.post('/auth/refresh', { refreshToken }).then(r => r.data),
    forgot: (email: string) => this.client.post('/auth/forgot', { email }).then(r => r.data),
    reset: (data: any) => this.client.post('/auth/reset', data).then(r => r.data),
    verify: (code: string) => this.client.post('/auth/verify', { code }).then(r => r.data),
  };

  // ===== Users =====
  users = {
    me: () => this.client.get('/users/me').then(r => r.data),
    update: (data: any) => this.client.patch('/users/me', data).then(r => r.data),
    changePassword: (data: any) => this.client.post('/users/me/password', data).then(r => r.data),
    getByUsername: (username: string) => this.client.get(`/users/${username}`).then(r => r.data),
    get: (id: string) => this.client.get(`/users/id/${id}`).then(r => r.data),
    list: (params: any = {}) => this.client.get('/users', { params }).then(r => r.data),
    follow: (id: string) => this.client.post(`/users/${id}/follow`).then(r => r.data),
    unfollow: (id: string) => this.client.delete(`/users/${id}/follow`).then(r => r.data),
    followers: (id: string, params: any = {}) => this.client.get(`/users/${id}/followers`, { params }).then(r => r.data),
    following: (id: string, params: any = {}) => this.client.get(`/users/${id}/following`, { params }).then(r => r.data),
    search: (q: string) => this.client.get('/users/search', { params: { q } }).then(r => r.data),
    suggestions: () => this.client.get('/users/suggestions').then(r => r.data),
    notifications: (params: any = {}) => this.client.get('/users/me/notifications', { params }).then(r => r.data),
  };

  // ===== AI =====
  ai = {
    chat: (messages: any[], type = 'chat', model = 'llama-3.3-70b-versatile') =>
      this.client.post('/ai/chat', { messages, type, model }).then(r => r.data),
    stream: (messages: any[], model: string) => this.client.post('/ai/stream', { messages, model }, { responseType: 'stream' }),
    conversations: (params: any = {}) => this.client.get('/ai/conversations', { params }).then(r => r.data),
    conversation: (id: string) => this.client.get(`/ai/conversations/${id}`).then(r => r.data),
    deleteConversation: (id: string) => this.client.delete(`/ai/conversations/${id}`).then(r => r.data),
    usage: () => this.client.get('/ai/usage').then(r => r.data),
    tools: {
      startupIdea: (data: any) => this.client.post('/ai/tools/startup-idea', data).then(r => r.data),
      businessPlan: (data: any) => this.client.post('/ai/tools/business-plan', data).then(r => r.data),
      code: (data: any) => this.client.post('/ai/tools/code', data).then(r => r.data),
      codeReview: (data: any) => this.client.post('/ai/tools/code-review', data).then(r => r.data),
      resume: (data: any) => this.client.post('/ai/tools/resume', data).then(r => r.data),
      coverLetter: (data: any) => this.client.post('/ai/tools/cover-letter', data).then(r => r.data),
      translate: (text: string, from = 'auto', to = 'en') => this.client.post('/ai/tools/translate', { text, from, to }).then(r => r.data),
      blog: (data: any) => this.client.post('/ai/tools/blog', data).then(r => r.data),
      social: (data: any) => this.client.post('/ai/tools/social', data).then(r => r.data),
      email: (data: any) => this.client.post('/ai/tools/email', data).then(r => r.data),
      summarize: (data: any) => this.client.post('/ai/tools/summarize', data).then(r => r.data),
      pitch: (data: any) => this.client.post('/ai/tools/pitch', data).then(r => r.data),
      marketResearch: (data: any) => this.client.post('/ai/tools/market-research', data).then(r => r.data),
      financialModel: (data: any) => this.client.post('/ai/tools/financial-model', data).then(r => r.data),
      legal: (data: any) => this.client.post('/ai/tools/legal', data).then(r => r.data),
      brandName: (data: any) => this.client.post('/ai/tools/brand-name', data).then(r => r.data),
      logo: (data: any) => this.client.post('/ai/tools/logo', data).then(r => r.data),
    },
  };

  // ===== Startups =====
  startups = {
    list: (params: any = {}) => this.client.get('/startups', { params }).then(r => r.data),
    featured: () => this.client.get('/startups/featured').then(r => r.data),
    trending: () => this.client.get('/startups/trending').then(r => r.data),
    get: (slug: string) => this.client.get(`/startups/${slug}`).then(r => r.data),
    create: (data: any) => this.client.post('/startups', data).then(r => r.data),
    update: (id: number, data: any) => this.client.patch(`/startups/${id}`, data).then(r => r.data),
    delete: (id: number) => this.client.delete(`/startups/${id}`).then(r => r.data),
    like: (id: number) => this.client.post(`/startups/${id}/like`).then(r => r.data),
    unlike: (id: number) => this.client.delete(`/startups/${id}/like`).then(r => r.data),
    follow: (id: number) => this.client.post(`/startups/${id}/follow`).then(r => r.data),
    team: (id: number) => this.client.get(`/startups/${id}/team`).then(r => r.data),
    updates: (id: number) => this.client.get(`/startups/${id}/updates`).then(r => r.data),
    addUpdate: (id: number, data: any) => this.client.post(`/startups/${id}/updates`, data).then(r => r.data),
  };

  // ===== Marketplace =====
  marketplace = {
    categories: () => this.client.get('/marketplace/categories').then(r => r.data),
    services: (params: any = {}) => this.client.get('/marketplace/services', { params }).then(r => r.data),
    featured: () => this.client.get('/marketplace/services/featured').then(r => r.data),
    service: (id: string) => this.client.get(`/marketplace/services/${id}`).then(r => r.data),
    create: (data: any) => this.client.post('/marketplace/services', data).then(r => r.data),
    update: (id: number, data: any) => this.client.patch(`/marketplace/services/${id}`, data).then(r => r.data),
    delete: (id: number) => this.client.delete(`/marketplace/services/${id}`).then(r => r.data),
    reviews: (id: number) => this.client.get(`/marketplace/services/${id}/reviews`).then(r => r.data),
    addReview: (id: number, data: any) => this.client.post(`/marketplace/services/${id}/reviews`, data).then(r => r.data),
    orders: (params: any = {}) => this.client.get('/marketplace/orders', { params }).then(r => r.data),
    order: (id: number) => this.client.get(`/marketplace/orders/${id}`).then(r => r.data),
    placeOrder: (data: any) => this.client.post('/marketplace/orders', data).then(r => r.data),
    acceptOrder: (id: number) => this.client.post(`/marketplace/orders/${id}/accept`).then(r => r.data),
    deliverOrder: (id: number, data: any) => this.client.post(`/marketplace/orders/${id}/deliver`, data).then(r => r.data),
    completeOrder: (id: number) => this.client.post(`/marketplace/orders/${id}/complete`).then(r => r.data),
    cancelOrder: (id: number) => this.client.post(`/marketplace/orders/${id}/cancel`).then(r => r.data),
  };

  // ===== Jobs =====
  jobs = {
    list: (params: any = {}) => this.client.get('/jobs', { params }).then(r => r.data),
    my: () => this.client.get('/jobs/me').then(r => r.data),
    myApplications: () => this.client.get('/jobs/applications/me').then(r => r.data),
    saved: () => this.client.get('/jobs/saved').then(r => r.data),
    get: (id: number) => this.client.get(`/jobs/${id}`).then(r => r.data),
    create: (data: any) => this.client.post('/jobs', data).then(r => r.data),
    update: (id: number, data: any) => this.client.patch(`/jobs/${id}`, data).then(r => r.data),
    delete: (id: number) => this.client.delete(`/jobs/${id}`).then(r => r.data),
    apply: (id: number, data: any) => this.client.post(`/jobs/${id}/apply`, data).then(r => r.data),
    save: (id: number) => this.client.post(`/jobs/${id}/save`).then(r => r.data),
    applications: (id: number) => this.client.get(`/jobs/${id}/applications`).then(r => r.data),
  };

  // ===== Investors =====
  investors = {
    list: (params: any = {}) => this.client.get('/investors', { params }).then(r => r.data),
    get: (id: number) => this.client.get(`/investors/${id}`).then(r => r.data),
    register: (data: any) => this.client.post('/investors', data).then(r => r.data),
    update: (id: number, data: any) => this.client.patch(`/investors/${id}`, data).then(r => r.data),
    portfolio: (id: number) => this.client.get(`/investors/${id}/portfolio`).then(r => r.data),
    pitch: (id: number, data: any) => this.client.post(`/investors/${id}/pitch`, data).then(r => r.data),
    myPitches: () => this.client.get('/investors/pitches/me').then(r => r.data),
  };

  // ===== Chats =====
  chats = {
    list: () => this.client.get('/chats').then(r => r.data),
    create: (data: any) => this.client.post('/chats', data).then(r => r.data),
    get: (id: number) => this.client.get(`/chats/${id}`).then(r => r.data),
    messages: (id: number, params: any = {}) => this.client.get(`/chats/${id}/messages`, { params }).then(r => r.data),
    sendMessage: (id: number, data: any) => this.client.post(`/chats/${id}/messages`, data).then(r => r.data),
    markRead: (id: number) => this.client.post(`/chats/${id}/read`).then(r => r.data),
    typing: (id: number) => this.client.post(`/chats/${id}/typing`).then(r => r.data),
  };

  // ===== Feed =====
  feed = {
    list: (params: any = {}) => this.client.get('/feed', { params }).then(r => r.data),
    trending: () => this.client.get('/feed/trending').then(r => r.data),
    get: (id: number) => this.client.get(`/feed/${id}`).then(r => r.data),
    create: (data: any) => this.client.post('/feed', data).then(r => r.data),
    delete: (id: number) => this.client.delete(`/feed/${id}`).then(r => r.data),
    like: (id: number) => this.client.post(`/feed/${id}/like`).then(r => r.data),
    unlike: (id: number) => this.client.delete(`/feed/${id}/like`).then(r => r.data),
    share: (id: number) => this.client.post(`/feed/${id}/share`).then(r => r.data),
    comments: (id: number) => this.client.get(`/feed/${id}/comments`).then(r => r.data),
    addComment: (id: number, data: any) => this.client.post(`/feed/${id}/comments`, data).then(r => r.data),
  };

  // ===== Payments =====
  payments = {
    intent: (data: any) => this.client.post('/payments/intent', data).then(r => r.data),
    history: () => this.client.get('/payments/history').then(r => r.data),
    plans: () => this.client.get('/payments/plans').then(r => r.data),
    currentSub: () => this.client.get('/payments/current').then(r => r.data),
    subscribe: (data: any) => this.client.post('/payments/subscribe', data).then(r => r.data),
    cancel: () => this.client.post('/payments/cancel').then(r => r.data),
    invoices: () => this.client.get('/payments/invoices').then(r => r.data),
    balance: () => this.client.get('/payments/balance').then(r => r.data),
    buyTokens: (data: any) => this.client.post('/payments/buy', data).then(r => r.data),
    spendTokens: (data: any) => this.client.post('/payments/spend', data).then(r => r.data),
    tokenHistory: () => this.client.get('/payments/history?type=tokens').then(r => r.data),
    referral: {
      code: () => this.client.get('/payments/code').then(r => r.data),
      stats: () => this.client.get('/payments/stats').then(r => r.data),
      process: (code: string) => this.client.post('/payments/process', { code }).then(r => r.data),
      list: () => this.client.get('/payments/list').then(r => r.data),
    },
  };

  // ===== Notifications =====
  notifications = {
    list: (params: any = {}) => this.client.get('/notifications', { params }).then(r => r.data),
    read: (id: number) => this.client.post(`/notifications/${id}/read`).then(r => r.data),
    readAll: () => this.client.post('/notifications/read-all').then(r => r.data),
    unreadCount: () => this.client.get('/notifications/unread/count').then(r => r.data),
  };

  // ===== Uploads =====
  uploads = {
    file: (file: File, onProgress?: (p: number) => void) => {
      const form = new FormData();
      form.append('file', file);
      return this.client.post('/uploads/file', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress && e.total && onProgress(Math.round((e.loaded * 100) / e.total)),
      }).then(r => r.data);
    },
    image: (file: File, onProgress?: (p: number) => void) => {
      const form = new FormData();
      form.append('file', file);
      return this.client.post('/uploads/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress && e.total && onProgress(Math.round((e.loaded * 100) / e.total)),
      }).then(r => r.data);
    },
  };

  // ===== Analytics =====
  analytics = {
    dashboard: () => this.client.get('/analytics/dashboard').then(r => r.data),
    user: (period = '30d') => this.client.get('/analytics/user', { params: { period } }).then(r => r.data),
    platform: () => this.client.get('/analytics/platform').then(r => r.data),
  };

  // ===== Admin =====
  admin = {
    stats: () => this.client.get('/admin/stats').then(r => r.data),
    listUsers: (params: any = {}) => this.client.get('/admin/users', { params }).then(r => r.data),
    banUser: (id: string) => this.client.post(`/admin/users/${id}/ban`).then(r => r.data),
    unbanUser: (id: string) => this.client.post(`/admin/users/${id}/unban`).then(r => r.data),
    reports: () => this.client.get('/admin/reports').then(r => r.data),
    resolveReport: (id: number, data: any) => this.client.post(`/admin/reports/${id}/resolve`, data).then(r => r.data),
  };
}

const api = new ApiClient();
export default api;
export { api };
