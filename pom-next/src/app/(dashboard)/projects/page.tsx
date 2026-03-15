'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/badges';
import { formatDate } from '@/lib/utils/dates';
import { Project, Collaborator } from '@/types';
import { Plus, Eye, Archive, Trash2 } from 'lucide-react';

export default function ProjectsListPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string;
  const canEdit = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
    ]).then(([projectsData, collabsData]) => {
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setCollaborators(Array.isArray(collabsData) ? collabsData : []);
      setLoading(false);
    });
  }, []);

  const getChefProjet = (id?: string) => {
    if (!id) return '-';
    const c = collaborators.find(c => c._id === id);
    return c ? `${c.prenom} ${c.nom}` : '-';
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archiver ce projet ?')) return;
    const project = projects.find(p => p._id === id);
    if (!project) return;

    const activeTasks = project.taches?.filter(t => t.statut === 'Initial' || t.statut === 'En cours') || [];
    if (activeTasks.length > 0) {
      alert('Vous devez finaliser toutes les tâches avant de pouvoir archiver ce projet.');
      return;
    }

    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: 'Archivé' }),
    });
    setProjects(projects.map(p => p._id === id ? { ...p, statut: 'Archivé' } : p));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce projet ?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(projects.filter(p => p._id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
        {canEdit && (
          <Link
            href="/projects/create"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chef de projet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin théorique</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.nom}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{project.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getChefProjet(project.chef_projet)}</td>
                  <td className="px-4 py-3"><StatusBadge status={project.statut} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(project.date_debut)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(project.date_fin_theorique)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/projects/${project._id}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600" title="Voir">
                        <Eye className="h-4 w-4" />
                      </Link>
                      {canEdit && project.statut !== 'Archivé' && project.statut !== 'Terminé(e)' && (
                        <>
                          <button onClick={() => handleArchive(project._id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600" title="Archiver">
                            <Archive className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(project._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600" title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Aucun projet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
