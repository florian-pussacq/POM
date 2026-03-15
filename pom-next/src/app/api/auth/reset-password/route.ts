import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { db } from '@/lib/data/store';

export async function POST(request: Request) {
  try {
    const { pseudo } = await request.json();
    if (!pseudo) {
      return NextResponse.json(
        { success: false, message: 'Pseudo requis' },
        { status: 422 }
      );
    }

    const user = db.getCollaboratorByPseudo(pseudo);
    if (user) {
      const newPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
      const hashed = await bcryptjs.hash(newPassword, 12);
      db.updateCollaboratorPassword(user._id, hashed);
      // In production, send email with newPassword
      console.log(`[DEV] New password for ${pseudo}: ${newPassword}`);
    }

    // Always return same message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'Si ce pseudo existe, un email de réinitialisation a été envoyé.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
