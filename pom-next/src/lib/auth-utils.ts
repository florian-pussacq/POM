import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Non authentifié');
  }
  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireAuth();
  const userRole = (session.user as Record<string, unknown>).role as UserRole;
  if (!roles.includes(userRole)) {
    throw new Error('Accès refusé');
  }
  return session;
}

export function getUserFromSession(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user) return null;
  const user = session.user as Record<string, unknown>;
  return {
    id: user.id as string,
    role: user.role as UserRole,
    pseudo: user.pseudo as string,
    prenom: user.prenom as string,
    nom: user.nom as string,
    email: session.user.email || '',
  };
}
