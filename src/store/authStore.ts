import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogleToken: (firebaseToken: string) => Promise<void>;
  mockLogin: (name: string, email: string) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
        set({ token });
      },
      setLoading: (loading) => set({ loading }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { access_token, user } = res.data;
          get().setToken(access_token);
          set({ user });
        } finally {
          set({ loading: false });
        }
      },

      registerUser: async (email, password, name) => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/register', { email, password, name });
          const { access_token, user } = res.data;
          get().setToken(access_token);
          set({ user });
        } finally {
          set({ loading: false });
        }
      },

      loginWithGoogleToken: async (firebaseToken) => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/firebase-login', { firebase_token: firebaseToken });
          const { access_token, user } = res.data;
          get().setToken(access_token);
          set({ user });
        } finally {
          set({ loading: false });
        }
      },

      mockLogin: (name, email) => {
        const mockUser: User = {
          uid: 'mock_uid_' + Math.random().toString(36).slice(2),
          email,
          displayName: name,
          photoURL: null,
          emailVerified: true,
          plan: 'pro',
        };
        const mockToken = 'mock_jwt_token_' + Math.random().toString(36).slice(2);
        get().setToken(mockToken);
        set({ user: mockUser });
      },

      logout: async () => {
        get().setToken(null);
        set({ user: null });
      },

      initialize: async () => {
        if (get().initialized) return;
        set({ initialized: true });

        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            set({ token, loading: true });
            const res = await api.get('/auth/me');
            set({ user: res.data });
          } catch (e) {
            console.warn("Session restore failed, logging out", e);
            get().logout();
          } finally {
            set({ loading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage-v2',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
