// Centralized API client for 00o.uz
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor - add token
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      if (typeof window !== 'undefined') {
        const lang = localStorage.getItem('locale') || 'uz';
        config.headers['Accept-Language'] = lang;
      }
      return config;
    });

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (r) => r,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          // Try refresh token
          const refresh = localStorage.getItem('refreshToken');
          if (refresh && !error.config?.url?.includes('/auth/')) {
            try {
              const res = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh });
              const data = res.data?.data || res.data;
              if (data.access_token) {
                this.setToken(data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                if (error.config) {
                  error.config.headers.Authorization = `Bearer ${data.access_token}`;
                  return this.client.request(error.config);
                }
              }
            } catch {
              this.clear();
              if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
                window.location.href = '/auth/login';
              }
            }
          } else {
            this.clear();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from storage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') localStorage.setItem('accessToken', token);
  }

  clear() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Generic helpers
  get<T = any>(url: string, params?: any) {
    return this.client.get<T>(url, { params }).then((r) => r.data);
  }
  post<T = any>(url: string, data?: any) {
    return this.client.post<T>(url, data).then((r) => r.data);
  }
  put<T = any>(url: string, data?: any) {
    return this.client.put<T>(url, data).then((r) => r.data);
  }
  patch<T = any>(url: string, data?: any) {
    return this.client.patch<T>(url, data).then((r) => r.data);
  }
  delete<T = any>(url: string) {
    return this.client.delete<T>(url).then((r) => r.data);
  }

  // ===== AUTH =====
  auth = {
    login: (email: string, password: string) => this.post('/auth/login', { email, password }),
    register: (data: any) => this.post('/auth/register', data),
    logout: () => this.post('/auth/logout'),
    me: () => this.get('/auth/me'),
    refresh: (refresh_token: string) => this.post('/auth/refresh', { refresh_token }),
    forgotPassword: (email: string) => this.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) => this.post('/auth/reset-password', { token, password }),
    verifyEmail: (token: string) => this.post('/auth/verify-email', { token }),
    telegram: (initData: string) => this.post('/auth/telegram', { initData }),
    enable2FA: () => this.post('/auth/2fa/enable'),
    verify2FA: (code: string) => this.post('/auth/2fa/verify', { code }),
  };

  // ===== USERS =====
  users = {
    me: () => this.get('/users/me'),
    update: (data: any) => this.patch('/users/me', data),
    uploadAvatar: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return this.client.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    },
    get: (id: string) => this.get(`/users/${id}`),
    byUsername: (username: string) => this.get(`/users/by/${username}`),
    search: (q: string) => this.get('/users/search', { q }),
    follow: (id: string) => this.post(`/users/${id}/follow`),
    unfollow: (id: string) => this.delete(`/users/${id}/follow`),
    followers: (id: string) => this.get(`/users/${id}/followers`),
    following: (id: string) => this.get(`/users/${id}/following`),
    stats: (id: string) => this.get(`/users/${id}/stats`),
  };

  // ===== AI =====
  ai = {
    chat: (messages: any[], feature = 'chat', model = 'llama-3.3-70b') =>
      this.post('/ai/chat', { messages, feature, model }),
    stream: (messages: any[], feature = 'chat') =>
      this.post('/ai/stream', { messages, feature }),
    tools: {
      startupIdea: (data: any) => this.post('/ai/tools/startup-idea', data),
      businessPlan: (data: any) => this.post('/ai/tools/business-plan', data),
      code: (data: any) => this.post('/ai/tools/code', data),
      codeReview: (code: string, lang = 'typescript') => this.post('/ai/tools/code-review', { code, language: lang }),
      resume: (data: any) => this.post('/ai/tools/resume', data),
      coverLetter: (data: any) => this.post('/ai/tools/cover-letter', data),
      translate: (text: string, from: string, to: string) => this.post('/ai/tools/translate', { text, from, to }),
      blog: (data: any) => this.post('/ai/tools/blog', data),
      social: (data: any) => this.post('/ai/tools/social', data),
      email: (data: any) => this.post('/ai/tools/email', data),
      summarize: (text: string) => this.post('/ai/tools/summarize', { text }),
      pitch: (data: any) => this.post('/ai/tools/pitch', data),
      marketResearch: (data: any) => this.post('/ai/tools/market-research', data),
      financialModel: (data: any) => this.post('/ai/tools/financial-model', data),
      legal: (data: any) => this.post('/ai/tools/legal', data),
      brandName: (data: any) => this.post('/ai/tools/brand-name', data),
      logo: (data: any) => this.post('/ai/tools/logo', data),
      analyzeImage: (imageUrl: string, prompt: string) => this.post('/ai/tools/analyze-image', { imageUrl, prompt }),
    },
    history: (params?: any) => this.get('/ai/history', params),
    models: () => this.get('/ai/models'),
    usage: () => this.get('/ai/usage'),
  };

  // ===== STARTUPS =====
  startups = {
    list: (params?: any) => this.get('/startups', params),
    get: (id: string) => this.get(`/startups/${id}`),
    bySlug: (slug: string) => this.get(`/startups/slug/${slug}`),
    create: (data: any) => this.post('/startups', data),
    update: (id: string, data: any) => this.patch(`/startups/${id}`, data),
    delete: (id: string) => this.delete(`/startups/${id}`),
    my: () => this.get('/startups/me/all'),
    fundings: (id: string) => this.get(`/startups/${id}/fundings`),
    createFunding: (id: string, data: any) => this.post(`/startups/${id}/fundings`, data),
    team: (id: string) => this.get(`/startups/${id}/team`),
    addTeam: (id: string, data: any) => this.post(`/startups/${id}/team`, data),
    metrics: (id: string) => this.get(`/startups/${id}/metrics`),
    search: (q: string) => this.get('/startups/search', { q }),
  };

  // ===== MARKETPLACE =====
  marketplace = {
    services: (params?: any) => this.get('/marketplace/services', params),
    service: (id: string) => this.get(`/marketplace/services/${id}`),
    createService: (data: any) => this.post('/marketplace/services', data),
    updateService: (id: string, data: any) => this.patch(`/marketplace/services/${id}`, data),
    deleteService: (id: string) => this.delete(`/marketplace/services/${id}`),
    categories: () => this.get('/marketplace/categories'),
    myServices: () => this.get('/marketplace/services/me'),
    orders: (params?: any) => this.get('/marketplace/orders', params),
    order: (id: string) => this.get(`/marketplace/orders/${id}`),
    createOrder: (data: any) => this.post('/marketplace/orders', data),
    updateOrder: (id: string, data: any) => this.patch(`/marketplace/orders/${id}`, data),
    reviews: (serviceId: string) => this.get(`/marketplace/services/${serviceId}/reviews`),
    createReview: (serviceId: string, data: any) => this.post(`/marketplace/services/${serviceId}/reviews`, data),
  };

  // ===== JOBS =====
  jobs = {
    list: (params?: any) => this.get('/jobs', params),
    get: (id: string) => this.get(`/jobs/${id}`),
    create: (data: any) => this.post('/jobs', data),
    update: (id: string, data: any) => this.patch(`/jobs/${id}`, data),
    delete: (id: string) => this.delete(`/jobs/${id}`),
    my: () => this.get('/jobs/me'),
    apply: (id: string, data: any) => this.post(`/jobs/${id}/apply`, data),
    applications: (jobId: string) => this.get(`/jobs/${jobId}/applications`),
    myApplications: () => this.get('/jobs/applications/me'),
    save: (id: string) => this.post(`/jobs/${id}/save`),
    saved: () => this.get('/jobs/saved'),
  };

  // ===== INVESTORS =====
  investors = {
    list: (params?: any) => this.get('/investors', params),
    get: (id: string) => this.get(`/investors/${id}`),
    register: (data: any) => this.post('/investors', data),
    update: (id: string, data: any) => this.patch(`/investors/${id}`, data),
    pitch: (id: string, data: any) => this.post(`/investors/${id}/pitch`, data),
    myPitches: () => this.get('/investors/pitches/me'),
    portfolio: (id: string) => this.get(`/investors/${id}/portfolio`),
  };

  // ===== CHAT =====
  chats = {
    list: () => this.get('/chats'),
    get: (id: string) => this.get(`/chats/${id}`),
    create: (data: any) => this.post('/chats', data),
    messages: (id: string, params?: any) => this.get(`/chats/${id}/messages`, params),
    send: (id: string, data: any) => this.post(`/chats/${id}/messages`, data),
    markRead: (id: string) => this.post(`/chats/${id}/read`),
    typing: (id: string) => this.post(`/chats/${id}/typing`),
  };

  // ===== FEED =====
  feed = {
    list: (params?: any) => this.get('/feed', params),
    create: (data: any) => this.post('/feed', data),
    get: (id: string) => this.get(`/feed/${id}`),
    delete: (id: string) => this.delete(`/feed/${id}`),
    like: (id: string) => this.post(`/feed/${id}/like`),
    unlike: (id: string) => this.delete(`/feed/${id}/like`),
    comments: (id: string) => this.get(`/feed/${id}/comments`),
    addComment: (id: string, text: string) => this.post(`/feed/${id}/comments`, { text }),
    share: (id: string) => this.post(`/feed/${id}/share`),
    trending: () => this.get('/feed/trending'),
  };

  // ===== PAYMENTS =====
  payments = {
    createIntent: (data: any) => this.post('/payments/intent', data),
    stripeWebhook: (data: any) => this.post('/payments/stripe/webhook', data),
    payme: (data: any) => this.post('/payments/payme', data),
    click: (data: any) => this.post('/payments/click', data),
    history: () => this.get('/payments/history'),
  };

  // ===== SUBSCRIPTIONS =====
  subscriptions = {
    plans: () => this.get('/subscriptions/plans'),
    current: () => this.get('/subscriptions/current'),
    subscribe: (planId: string) => this.post('/subscriptions/subscribe', { planId }),
    cancel: () => this.post('/subscriptions/cancel'),
    invoices: () => this.get('/subscriptions/invoices'),
  };

  // ===== TOKENS =====
  tokens = {
    balance: () => this.get('/tokens/balance'),
    buy: (amount: number) => this.post('/tokens/buy', { amount }),
    spend: (amount: number, reason: string) => this.post('/tokens/spend', { amount, reason }),
    history: () => this.get('/tokens/history'),
  };

  // ===== REFERRALS =====
  referrals = {
    code: () => this.get('/referrals/code'),
    stats: () => this.get('/referrals/stats'),
    process: (code: string) => this.post('/referrals/process', { code }),
    list: () => this.get('/referrals/list'),
  };

  // ===== NOTIFICATIONS =====
  notifications = {
    list: (params?: any) => this.get('/notifications', params),
    markRead: (id: string) => this.post(`/notifications/${id}/read`),
    markAllRead: () => this.post('/notifications/read-all'),
    unread: () => this.get('/notifications/unread/count'),
  };

  // ===== ANALYTICS =====
  analytics = {
    dashboard: () => this.get('/analytics/dashboard'),
    user: (period = '30d') => this.get('/analytics/user', { period }),
    platform: () => this.get('/analytics/platform'),
  };

  // ===== ADMIN =====
  admin = {
    users: (params?: any) => this.get('/admin/users', params),
    ban: (id: string) => this.post(`/admin/users/${id}/ban`),
    unban: (id: string) => this.post(`/admin/users/${id}/unban`),
    stats: () => this.get('/admin/stats'),
    reports: () => this.get('/admin/reports'),
    resolveReport: (id: string, action: string) => this.post(`/admin/reports/${id}/resolve`, { action }),
  };

  // ===== UPLOADS =====
  uploads = {
    file: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return this.client.post('/uploads/file', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    },
    image: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return this.client.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    },
  };
}

export const api = new ApiClient();
export default api;
