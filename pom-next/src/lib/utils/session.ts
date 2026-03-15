import { Session } from 'next-auth';
import { UserRole } from '@/types';

export function getUserRole(session: Session | null): UserRole {
  if (!session?.user) return 'collaborateur';
  return (session.user.role as UserRole) || 'collaborateur';
}

export function getUserPrenom(session: Session | null): string {
  if (!session?.user) return '';
  return (session.user.prenom as string) || '';
}

export function getUserId(session: Session | null): string {
  if (!session?.user) return '';
  return session.user.id || '';
}
