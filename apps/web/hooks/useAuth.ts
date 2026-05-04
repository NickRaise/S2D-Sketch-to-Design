"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuthContext } from "@/contexts/AuthContext";

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const GENERIC_ERROR = "Something went wrong. Please try again.";

function validate(email: string, password: string, name?: string): string | null {
  if (name !== undefined && !name) return "All fields are required.";
  if (!email || !password) return "Email and password are required.";
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.error) {
    return err.response.data.error;
  }
  return GENERIC_ERROR;
}

export function useAuth() {
  const {
    user,
    isCheckingAuth,
    login: authLogin,
    signup: authSignup,
    googleLogin: authGoogleLogin,
    logout: authLogout,
  } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const googleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        await authGoogleLogin(tokenResponse.access_token);
        router.push("/");
      } catch (e) {
        setError(extractApiError(e));
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google sign-in failed. Please try again."),
  });

  async function login(email: string, password: string) {
    const err = validate(email, password);
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);
    try {
      await authLogin(email, password);
      router.push("/");
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function signup(name: string, email: string, password: string) {
    const err = validate(email, password, name);
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);
    try {
      await authSignup(name, email, password);
      router.push("/");
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await authLogout();
    } finally {
      router.push("/auth");
    }
  }

  function clearError() {
    setError(null);
  }

  return { user, loading, isCheckingAuth, error, login, signup, googleSignIn, logout, clearError };
}
