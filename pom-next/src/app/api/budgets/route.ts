import { NextResponse } from 'next/server';
import { db } from '@/lib/data/store';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as UserRole;
    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    return NextResponse.json(db.getBudgets());
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

    const userRole = (session.user as unknown as Record<string, unknown>).role as UserRole;
    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const data = await request.json();
    if (!data.libelle || data.montant === undefined) {
      return NextResponse.json(
        { success: false, message: 'Le libellé et le montant sont requis' },
        { status: 422 }
      );
    }

    const budget = db.createBudget(data);
    return NextResponse.json(budget, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
