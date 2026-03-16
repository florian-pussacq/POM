import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth config (no Node.js-only imports like bcryptjs).
 * Used by middleware.ts for route protection.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/reset-password');

      // Allow auth pages for unauthenticated users;
      // redirect authenticated users away from auth pages
      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      // Protect all other pages: require authentication
      return isLoggedIn;
    },
  },
  providers: [], // Providers are added in auth.ts (requires Node.js runtime)
} satisfies NextAuthConfig;
