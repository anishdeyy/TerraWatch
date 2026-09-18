import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  register: async (name: string, email: string, password: string, role: string = 'VIEWER'): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('terrawatch_token');
    localStorage.removeItem('terrawatch_user');
    localStorage.removeItem('darukaa_token');
    localStorage.removeItem('darukaa_user');
  }
};
