'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Collaborator } from '@/types';
import { Plus, Eye, Trash2 } from 'lucide-react';

export default function CollaboratorsListPage() {
  const { data: session } = useSession();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as Record<string, unknown>)?.role as string;

  useEffect(() => {
    fetch('/api/collaborators')
      .then(r => r.json())
      .then(data => {
        setCollaborators(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce collaborateur ?')) return;
    await fetch(`/api/collaborators/${id}`, { method: 'DELETE' });
    setCollaborators(collaborators.filter(c => c._id !== id));
  };

  const getManagerName = (managerId?: string | null) => {
    if (!managerId) return '-';
    const m = collaborators.find(c => c._id === managerId);
    return m ? `${m.prenom} ${m.nom}` : '-';
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
        <h1 className="text-2xl font-bold text-gray-900">Collaborateurs</h1>
        <Link
          href="/collaborators/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau collaborateur
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pseudo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fonction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collaborators.map((collab) => (
                <tr key={collab._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{collab.prenom} {collab.nom}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{collab.pseudo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{collab.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{collab.fonction || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      collab.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      collab.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {collab.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getManagerName(collab.manager)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/collaborators/${collab._id}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
                        <Eye className="h-4 w-4" />
                      </Link>
                      {userRole === 'admin' && (
                        <button onClick={() => handleDelete(collab._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
