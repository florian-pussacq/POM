import { NextResponse } from 'next/server';
import { db } from '@/lib/data/store';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const collaborator = db.getCollaboratorById(id);
    if (!collaborator) {
      return NextResponse.json({ success: false, message: 'Collaborateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(collaborator);
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const data = await request.json();
    // Don't allow password change via this endpoint
    delete data.mot_de_passe;

    const collaborator = db.updateCollaborator(id, data);
    if (!collaborator) {
      return NextResponse.json({ success: false, message: 'Collaborateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(collaborator);
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as UserRole;
    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const deleted = db.deleteCollaborator(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Collaborateur introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Collaborateur supprimé' });
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
