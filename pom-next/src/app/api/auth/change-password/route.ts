import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { db } from '@/lib/data/store';
import { auth } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
      return NextResponse.json(
        { success: false, message: 'Les deux mots de passe sont requis' },
        { status: 422 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Le nouveau mot de passe doit faire au moins 8 caractères' },
        { status: 422 }
      );
    }

    const user = db.getCollaboratorByPseudo(
      (session.user as Record<string, unknown>).pseudo as string
    );
    if (!user || !user.mot_de_passe) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    const isValid = await bcryptjs.compare(current_password, user.mot_de_passe);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    const hashed = await bcryptjs.hash(new_password, 12);
    db.updateCollaboratorPassword(user._id, hashed);

    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
