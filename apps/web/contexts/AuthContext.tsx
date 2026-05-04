"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";
import type { IUser, IApiResponse, IAuthData } from "@/types/auth";

interface AuthContextValue {
  user: IUser | null;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    api
      .get<IApiResponse<IAuthData>>("/me")
      .then((res) => setUser(res.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setIsCheckingAuth(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<IApiResponse<IAuthData>>("/auth/login", { email, password });
    setUser(res.data.data.user);
  }

  async function signup(name: string, email: string, password: string) {
    const res = await api.post<IApiResponse<IAuthData>>("/auth/register", { name, email, password });
    setUser(res.data.data.user);
  }

  async function googleLogin(accessToken: string) {
    const res = await api.post<IApiResponse<IAuthData>>("/auth/oauth/google", { accessToken });
    setUser(res.data.data.user);
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isCheckingAuth, login, signup, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
