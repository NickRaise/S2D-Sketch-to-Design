import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name: string | undefined | null;
      email: string | undefined | null;
      image?: string;
      userId: string; // Added userId to the session user object
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string | undefined;
    name?: string | undefined;
    image?: string;
    userId: string; // Added userId to the JWT token
  }
}
