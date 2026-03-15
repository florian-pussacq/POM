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
    let projects = db.getProjects();

    if (userRole !== 'admin') {
      projects = db.getProjectsByCollaborator(session.user.id);
    }

    return NextResponse.json(projects);
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
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    const data = await request.json();
    if (!data.nom) {
      return NextResponse.json({ success: false, message: 'Le nom du projet est requis' }, { status: 422 });
    }

    // Auto-set creator as chef_projet and add to collaborators
    if (!data.chef_projet) data.chef_projet = session.user.id;
    if (!data.collaborateurs) data.collaborateurs = [];
    if (!data.collaborateurs.includes(session.user.id)) {
      data.collaborateurs.push(session.user.id);
    }

    const project = db.createProject(data);
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
