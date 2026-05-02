"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IAuthResponse } from "@/types/auth";

async function handleLogin(email: string, password: string, image?: string) {
  try {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    // TODO: handle functionality after login, such as redirecting to the homepage or showing a success message
    if (res?.ok) {
      console.log("Login successful");
    } else {
      console.error("Login failed", res);
    }
  } catch (error) {
    console.error("Login error:", error);
  }
}

async function handleSignUp(name: string, email: string, password: string) {
  try {
    const res = await axios.post<IAuthResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}auth/register`,
      {
        name,
        email,
        password,
      },
    );

    // TODO: handle functionality after sign up, such as redirecting to the homepage or showing a success message
    const result = res.data;
    console.log("Sign up successful");
  } catch (error) {
    console.error("Sign up error:", error);
  }
}

const page = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { data: session } = useSession();
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleOnSubmit = async () => {
    if (isLogin) {
      await handleLogin(email, password);
    } else {
      await handleSignUp(name, email, password);
      await handleLogin(email, password);
    }
  };

  const loginInfo = {
    title: "Welcome back",
    description: "Sign in to your account to continue",
    action: "Sign in",
    redirectText: "Don't have an account? ",
    redirectLinkText: "Sign up",
  };

  const signUpInfo = {
    title: "Create an account",
    description: "Get started with your free account today",
    action: "Create Account",
    redirectText: "Already have an account? ",
    redirectLinkText: "Sign in",
  };

  return (
    <section className="bg-background grid min-h-screen grid-rows-[auto_1fr] px-4">
      <div className="mx-auto w-full max-w-7xl border-b py-3">
        <Link
          href="/"
          aria-label="go home"
          className="inline-block border-t-2 border-transparent py-3"
        >
          S2D
        </Link>
      </div>

      <div className="m-auto w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-medium">
            {isLogin ? loginInfo.title : signUpInfo.title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isLogin ? loginInfo.description : signUpInfo.description}
          </p>
        </div>
        <Card variant="outline" className="mt-6 p-8">
          <form action="" className="space-y-5">
            {!isLogin && (
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm">
                  Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                handleOnSubmit();
              }}
            >
              {isLogin ? loginInfo.action : signUpInfo.action}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <hr className="flex-1" />
            <span className="text-muted-foreground text-xs">
              or continue with
            </span>
            <hr className="flex-1" />
          </div>

          <div className="grid grid-cols-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => signIn("google")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              <span>Google</span>
            </Button>
          </div>
        </Card>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {isLogin ? loginInfo.redirectText : signUpInfo.redirectText}
          <button
            className="text-primary font-medium hover:underline hover:cursor-pointer"
            onClick={() => setIsLogin((state) => !state)}
          >
            {isLogin ? loginInfo.redirectLinkText : signUpInfo.redirectLinkText}
          </button>
        </p>
      </div>
    </section>
  );
};

export default page;
