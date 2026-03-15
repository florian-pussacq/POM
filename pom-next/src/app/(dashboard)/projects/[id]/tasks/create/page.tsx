'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { Project, Collaborator } from '@/types';
import { settings } from '@/lib/settings';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function TaskCreatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    libelle: '',
    categorie: '',
    description: '',
    date_debut: '',
    date_fin_theorique: '',
    selectedCollabs: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
    ]).then(([projectData, collabsData]) => {
      setProject(projectData);
      setCollaborators(Array.isArray(collabsData) ? collabsData : []);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libelle: form.libelle,
        categorie: form.categorie || undefined,
        description: form.description || undefined,
        date_debut: form.date_debut ? new Date(form.date_debut).toISOString() : undefined,
        date_fin_theorique: form.date_fin_theorique ? new Date(form.date_fin_theorique).toISOString() : undefined,
        collaborateurs: form.selectedCollabs,
      }),
    });

    if (res.ok) {
      router.push(`/projects/${id}`);
    } else {
      setLoading(false);
      alert('Erreur lors de la création de la tâche');
    }
  };

  const projectCollabs = collaborators.filter(c => project?.collaborateurs?.includes(c._id));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}`} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle tâche</h1>
        {project && <span className="text-gray-500">– {project.nom}</span>}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
          <input
            type="text"
            value={form.libelle}
            onChange={(e) => setForm({ ...form, libelle: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
          <select
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Sélectionner --</option>
            {settings.categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={form.date_debut}
              onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin théorique</label>
            <input
              type="date"
              value={form.date_fin_theorique}
              onChange={(e) => setForm({ ...form, date_fin_theorique: e.target.value })}
              min={form.date_debut}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Collaborateurs</label>
          <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
            {projectCollabs.map(c => (
              <label key={c._id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.selectedCollabs.includes(c._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({ ...form, selectedCollabs: [...form.selectedCollabs, c._id] });
                    } else {
                      setForm({ ...form, selectedCollabs: form.selectedCollabs.filter(cid => cid !== c._id) });
                    }
                  }}
                  className="rounded"
                />
                {c.prenom} {c.nom}
              </label>
            ))}
            {projectCollabs.length === 0 && (
              <p className="text-sm text-gray-500">Aucun collaborateur sur ce projet</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Création...' : 'Créer la tâche'}
        </button>
      </form>
    </div>
  );
}
