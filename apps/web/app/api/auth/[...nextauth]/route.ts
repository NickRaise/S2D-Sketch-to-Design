import { GoogleOAuthResponse, ILoginResponse } from "@/types/auth";
import axios from "axios";
import NextAuth, { Profile } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Temporary hardcoded admin user for testing
        if (
          credentials?.email == "nikhil@gmail.com" &&
          credentials.password == "123456"
        ) {
          return {
            id: "item-user",
            email: credentials.email,
            name: "Admin",
          };
        }

        const user = await handleLogin(credentials.email, credentials.password);

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Profile will be received in case of OAuth
      if (profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.image = profile.image;

        // is google oauth
        if (account?.provider === "google") {
          const userData = await handleGoogleOAuth(profile);
          if (userData) {
            token.email = userData.email;
            token.name = userData.name;
            token.image = userData.image;
          }
        }

        return token;
      }

      // For Credentials logic
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        userId: token.userId,
        email: token.email,
        name: token.name,
        image: token.image,
      };

      return session;
    },
  },

  pages: {
    signIn: "/",
  },
});

async function handleGoogleOAuth(
  profile: Profile,
): Promise<GoogleOAuthResponse["user"] | null> {
  try {
    const response = await axios.post<GoogleOAuthResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}auth/oauth/google`,
      {
        email: profile.email,
        name: profile.name,
        image: profile.image,
      },
    );

    const data = response.data;
    if (!data.success) {
      console.error("Google OAuth failed:", data.message);
    }

    return data.user;
  } catch (error) {
    console.error("Error handling Google OAuth:", error);
    return null;
  }
}

async function handleLogin(
  email: string,
  password: string,
): Promise<ILoginResponse["user"] | null> {
  try {
    const response = await axios.post<ILoginResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}auth/login`,
      {
        email,
        password,
      },
    );

    const data = response.data;
    if (!data.success) {
      console.error("Login failed:", data.message);
    }

    return data.user;
  } catch (error) {
    console.error("Error handling login:", error);
    return null;
  }
}

export { handler as GET, handler as POST };
