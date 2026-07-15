import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
          const { accessToken, refreshToken } = res.data;
          useAuthStore.getState().setTokens(accessToken, refreshToken);
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return api.request(error.config);
          }
        } catch { useAuthStore.getState().logout(); if (typeof window !== 'undefined') window.location.href = '/login'; }
      } else { useAuthStore.getState().logout(); if (typeof window !== 'undefined') window.location.href = '/login'; }
    }
    const message = (error.response?.data as any)?.detail || error.message || 'Xatolik';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  telegram: (data: any) => api.post('/auth/telegram', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  setup2fa: () => api.post('/auth/2fa/setup'),
  enable2fa: (code: string) => api.post('/auth/2fa/enable', { code }),
  disable2fa: (code: string) => api.post('/auth/2fa/disable', { code }),
};

export const aiApi = {
  chat: (data: any) => api.post('/ai/chat', data),
  chats: () => api.get('/ai/chats'),
  getChat: (id: string) => api.get(`/ai/chats/${id}`),
  deleteChat: (id: string) => api.delete(`/ai/chats/${id}`),
  startupIdea: (data: any) => api.post('/ai/startup-idea', data),
  businessPlan: (data: any) => api.post('/ai/business-plan', data),
  pitchDeck: (data: any) => api.post('/ai/pitch-deck', data),
  resume: (data: any) => api.post('/ai/resume', data),
  coverLetter: (data: any) => api.post('/ai/cover-letter', data),
  generateCode: (data: any) => api.post('/ai/code', data),
  reviewCode: (data: any) => api.post('/ai/code/review', data),
  bugFix: (data: any) => api.post('/ai/code/bug-fix', data),
  sql: (data: any) => api.post('/ai/sql', data),
  translate: (data: any) => api.post('/ai/translate', data),
  summarize: (data: any) => api.post('/ai/summarize', data),
  blog: (data: any) => api.post('/ai/blog', data),
  email: (data: any) => api.post('/ai/email', data),
  marketing: (data: any) => api.post('/ai/marketing', data),
  seo: (data: any) => api.post('/ai/seo', data),
  logoPrompt: (data: any) => api.post('/ai/logo-prompt', data),
  domain: (data: any) => api.post('/ai/domain', data),
  brainstorm: (data: any) => api.post('/ai/brainstorm', data),
  projectPlan: (data: any) => api.post('/ai/project-plan', data),
  analyzeText: (data: any) => api.post('/ai/analyze-text', data),
  usage: () => api.get('/ai/usage'),
  models: () => api.get('/ai/models'),
};
