export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/((?!api/auth|api/version|_next/static|_next/image|favicon.ico|login|reset-password).*)',
  ],
};
