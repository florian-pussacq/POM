import { NextResponse } from 'next/server';
import { db } from '@/lib/data/store';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ role: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as UserRole;
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const { role } = await params;
    return NextResponse.json(db.getCollaboratorsByRole(role));
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
