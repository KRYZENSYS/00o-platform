// 00o.uz - API client
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.accessToken) config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });

    this.client.interceptors.response.use(
      (r) => r,
      async (err) => {
        if (err.response?.status === 401 && !err.config._retry) {
          err.config._retry = true;
          const refreshed = await this.refreshToken();
          if (refreshed) {
            err.config.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.client(err.config);
          }
        }
        return Promise.reject(err);
      }
    );

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('oo_access');
    }
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('oo_access', token);
      else localStorage.removeItem('oo_access');
    }
  }

  setRefreshToken(token: string | null) {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('oo_refresh', token);
      else localStorage.removeItem('oo_refresh');
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refresh = typeof window !== 'undefined' ? localStorage.getItem('oo_refresh') : null;
      if (!refresh) return false;
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
      this.setToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      return true;
    } catch { return false; }
  }

  // Auth
  register = (data: any) => this.client.post('/auth/register', data).then(r => r.data);
  login = (data: any) => this.client.post('/auth/login', data).then(r => r.data);
  logout = () => this.client.post('/auth/logout', { refreshToken: localStorage.getItem('oo_refresh') }).then(r => r.data);
  verifyEmail = (token: string) => this.client.post('/auth/verify-email', { token }).then(r => r.data);
  forgotPassword = (email: string) => this.client.post('/auth/forgot-password', { email }).then(r => r.data);
  resetPassword = (token: string, password: string) => this.client.post('/auth/reset-password', { token, password }).then(r => r.data);

  // User
  getMe = () => this.client.get('/users/me').then(r => r.data);
  updateMe = (data: any) => this.client.patch('/users/me', data).then(r => r.data);
  getUser = (username: string) => this.client.get(`/users/${username}`).then(r => r.data);
  follow = (username: string) => this.client.post(`/users/${username}/follow`).then(r => r.data);

  // Todos
  getTodos = (params?: any) => this.client.get('/todos', { params }).then(r => r.data);
  createTodo = (data: any) => this.client.post('/todos', data).then(r => r.data);
  updateTodo = (id: string, data: any) => this.client.patch(`/todos/${id}`, data).then(r => r.data);
  toggleTodo = (id: string) => this.client.post(`/todos/${id}/toggle`).then(r => r.data);
  deleteTodo = (id: string) => this.client.delete(`/todos/${id}`).then(r => r.data);
  todoStats = () => this.client.get('/todos/stats/summary').then(r => r.data);

  // Notes
  getNotes = (params?: any) => this.client.get('/notes', { params }).then(r => r.data);
  createNote = (data: any) => this.client.post('/notes', data).then(r => r.data);
  updateNote = (id: string, data: any) => this.client.patch(`/notes/${id}`, data).then(r => r.data);
  deleteNote = (id: string) => this.client.delete(`/notes/${id}`).then(r => r.data);

  // Habits
  getHabits = () => this.client.get('/habits').then(r => r.data);
  createHabit = (data: any) => this.client.post('/habits', data).then(r => r.data);
  logHabit = (id: string, data: any) => this.client.post(`/habits/${id}/log`, data).then(r => r.data);

  // Posts
  getFeed = (params?: any) => this.client.get('/posts/feed', { params }).then(r => r.data);
  createPost = (data: any) => this.client.post('/posts', data).then(r => r.data);
  likePost = (id: string) => this.client.post(`/posts/${id}/like`).then(r => r.data);
  commentPost = (id: string, data: any) => this.client.post(`/posts/${id}/comment`, data).then(r => r.data);

  // Chat
  getConversations = () => this.client.get('/chat/conversations').then(r => r.data);
  getMessages = (userId: string, params?: any) => this.client.get(`/chat/with/${userId}`, { params }).then(r => r.data);
  sendMessage = (data: any) => this.client.post('/chat/send', data).then(r => r.data);

  // Payments
  getPlans = () => this.client.get('/payments/plans').then(r => r.data);
  getSubscription = () => this.client.get('/payments/subscription').then(r => r.data);
  createPaymePayment = (plan: string) => this.client.post('/payments/payme/create', { plan }).then(r => r.data);

  // Upload
  upload = (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return this.client.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  };
}

export const api = new ApiClient();
