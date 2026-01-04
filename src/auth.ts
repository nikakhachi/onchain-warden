import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email && account?.provider === "google") {
        const username = (profile as any)?.name || user.name || user.email.split("@")[0];

        const result = await convex.action(api.users.authenticateOrCreateUserWithEmail, {
          email: user.email,
          username: username,
          jwt_token: account.id_token as string,
        });

        (user as any).convexAccessToken = result.accessToken;
        (user as any).convexExpiresAt = result.expiresAt;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user?.email) session.user.email = session.user.email;

      if (token.convexAccessToken) {
        (session as any).convexAccessToken = token.convexAccessToken;
        (session as any).convexExpiresAt = token.convexExpiresAt;
      }

      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = user.id;
        if (user.email) token.email = user.email;

        if ((user as any).convexAccessToken) {
          token.convexAccessToken = (user as any).convexAccessToken;
          token.convexExpiresAt = (user as any).convexExpiresAt;
        }
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      const callbackUrl = url && url !== baseUrl && url.startsWith("/") ? url : "/dashboard/alerts";
      const redirectUrl = new URL("/auth/callback/google", baseUrl);
      redirectUrl.searchParams.set("callbackUrl", callbackUrl);
      return redirectUrl.toString();
    },
  },
  pages: {
    signIn: "/dashboard/signin",
  },
});
