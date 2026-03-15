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

    const userRole = (session.user as unknown as Record<string, unknown>).role as UserRole;
    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const budget = db.getBudgetById(id);
    if (!budget) {
      return NextResponse.json({ success: false, message: 'Budget introuvable' }, { status: 404 });
    }

    return NextResponse.json(budget);
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
    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const budget = db.updateBudget(id, data);
    if (!budget) {
      return NextResponse.json({ success: false, message: 'Budget introuvable' }, { status: 404 });
    }

    return NextResponse.json(budget);
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
    const deleted = db.deleteBudget(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Budget introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Budget supprimé' });
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
