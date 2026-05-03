"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";
import { IAuthResponse } from "@/types/auth";

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const GENERIC_ERROR = "Something went wrong. Please try again.";

function validate(
  email: string,
  password: string,
  name?: string,
): string | null {
  if (name !== undefined && !name) {
    return "All fields are required.";
  }

  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    const validationError = validate(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
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
        setError("Invalid email or password.");
      }
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function signup(name: string, email: string, password: string) {
    const validationError = validate(email, password, name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.post<IAuthResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}auth/register`,
        { name, email, password },
      );

      await login(email, password);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(GENERIC_ERROR);
      }
    } finally {
      setLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return { login, signup, loading, error, clearError };
}
