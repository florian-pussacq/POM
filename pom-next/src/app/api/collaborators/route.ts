import { NextResponse } from 'next/server';
import { db } from '@/lib/data/store';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';
import bcryptjs from 'bcryptjs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as UserRole;
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    return NextResponse.json(db.getCollaborators());
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as UserRole;
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.nom || !data.prenom || !data.pseudo || !data.email || !data.mot_de_passe) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 422 }
      );
    }

    if (data.mot_de_passe.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe doit faire au moins 8 caractères' },
        { status: 422 }
      );
    }

    // Check pseudo uniqueness
    const existing = db.getCollaboratorByPseudo(data.pseudo);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Ce pseudo est déjà utilisé' },
        { status: 409 }
      );
    }

    // Manager can only create collaborateurs
    if (userRole === 'manager' && data.role !== 'collaborateur') {
      return NextResponse.json(
        { success: false, message: 'Un manager ne peut créer que des collaborateurs' },
        { status: 403 }
      );
    }

    // Auto-set manager for manager-created users
    if (userRole === 'manager') {
      data.manager = session.user.id;
    }

    // Hash password
    data.mot_de_passe = await bcryptjs.hash(data.mot_de_passe, 12);

    const collaborator = db.createCollaborator(data);
    return NextResponse.json(collaborator, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
