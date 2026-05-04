"use client";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "@/stores/authStore";

function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  useEffect(() => { checkAuth(); }, [checkAuth]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <AuthInitializer />
      {children}
    </GoogleOAuthProvider>
  );
}
