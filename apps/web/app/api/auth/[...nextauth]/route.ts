import NextAuth from "next-auth";
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
        // TEMP: Will replace the logic later
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

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, profile }) {
      // TEMP Debug
      console.log("NextAuth callback user", user);
      console.log("NextAuth callback profile", profile);

      // Profile will be received in case of OAuth
      if (profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.image;
      }

      // For Credentials logic
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        userId: token.userId,
        email: token.email,
        name: token.name,
        image: token.picture,
      };

      return session;
    },
  },

  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
