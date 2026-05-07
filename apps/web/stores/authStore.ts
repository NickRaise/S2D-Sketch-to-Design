import { create } from "zustand";
import api from "@/lib/axios";
import type { IUser, IApiResponse, IAuthData } from "@/types/auth";

interface AuthState {
  user: IUser | null;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await api.get<IApiResponse<IAuthData>>("/me");
      set({ user: res.data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post<IApiResponse<IAuthData>>("/auth/login", {
      email,
      password,
    });
    set({ user: res.data.user });
  },

  signup: async (name, email, password) => {
    const res = await api.post<IApiResponse<IAuthData>>("/auth/register", {
      name,
      email,
      password,
    });
    set({ user: res.data.user });
  },

  googleLogin: async (accessToken) => {
    const res = await api.post<IApiResponse<IAuthData>>("/auth/oauth/google", {
      accessToken,
    });
    set({ user: res.data.user });
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
}));
