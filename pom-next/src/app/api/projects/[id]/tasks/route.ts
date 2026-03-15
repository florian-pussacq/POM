import { NextResponse } from 'next/server';
import { db } from '@/lib/data/store';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';
import { generateTaskCode } from '@/lib/utils/dates';

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
    const tasks = db.getTasksForProject(id);
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as UserRole;
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const project = db.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, message: 'Projet introuvable' }, { status: 404 });
    }

    const data = await request.json();
    if (!data.libelle) {
      return NextResponse.json({ success: false, message: 'Le libellé est requis' }, { status: 422 });
    }

    // Auto-generate task code
    if (project.code) {
      const existingCodes = project.taches.map(t => t.code).filter(Boolean) as string[];
      data.code = generateTaskCode(project.code, existingCodes);
    }

    const task = db.createTask(id, data);
    if (!task) {
      return NextResponse.json({ success: false, message: 'Erreur lors de la création' }, { status: 500 });
    }

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
