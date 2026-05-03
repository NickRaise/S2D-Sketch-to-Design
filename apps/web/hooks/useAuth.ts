"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";
import { IAuthResponse } from "@/types/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (res?.ok) {
        // TODO: Add toast and redirect logic after successful login
        console.log("Login successful");
      } else {
        console.error("Login failed", res);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signup(name: string, email: string, password: string) {
    setLoading(true);
    try {
      await axios.post<IAuthResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}auth/register`,
        { name, email, password },
      );

      await login(email, password);
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  }

  return { login, signup, loading };
}
