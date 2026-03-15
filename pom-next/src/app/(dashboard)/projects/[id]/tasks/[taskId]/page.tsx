'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, Task, Collaborator } from '@/types';
import { settings } from '@/lib/settings';
import { StatusBadge } from '@/components/ui/badges';
import { toInputDate } from '@/lib/utils/dates';
import { ArrowLeft, Save } from 'lucide-react';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    libelle: '',
    categorie: '',
    statut: '',
    description: '',
    date_debut: '',
    date_fin_theorique: '',
    date_fin_reelle: '',
    selectedCollabs: [] as string[],
  });

  const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string;
  const canEdit = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch(`/api/projects/${id}/tasks/${taskId}`).then(r => r.json()),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
    ]).then(([projectData, taskData, collabsData]) => {
      setProject(projectData);
      if (taskData._id) {
        setTask(taskData);
        setForm({
          libelle: taskData.libelle || '',
          categorie: taskData.categorie || '',
          statut: taskData.statut || '',
          description: taskData.description || '',
          date_debut: toInputDate(taskData.date_debut),
          date_fin_theorique: toInputDate(taskData.date_fin_theorique),
          date_fin_reelle: toInputDate(taskData.date_fin_reelle),
          selectedCollabs: taskData.collaborateurs || [],
        });
      }
      setCollaborators(Array.isArray(collabsData) ? collabsData : []);
    });
  }, [id, taskId]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/projects/${id}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libelle: form.libelle,
        categorie: form.categorie || undefined,
        statut: form.statut,
        description: form.description || undefined,
        date_debut: form.date_debut ? new Date(form.date_debut).toISOString() : undefined,
        date_fin_theorique: form.date_fin_theorique ? new Date(form.date_fin_theorique).toISOString() : undefined,
        date_fin_reelle: form.statut === 'Terminé(e)' && form.date_fin_reelle ? new Date(form.date_fin_reelle).toISOString() : undefined,
        collaborateurs: form.selectedCollabs,
      }),
    });
    setSaving(false);
    router.push(`/projects/${id}`);
  };

  const projectCollabs = collaborators.filter(c => project?.collaborateurs?.includes(c._id));

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}`} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{task.libelle}</h1>
        <StatusBadge status={task.statut} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Code</label>
            <p className="text-gray-900 font-mono">{task.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Projet</label>
            <p className="text-gray-900">{project?.nom}</p>
          </div>
        </div>

        <hr />

        {canEdit ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
              <input
                type="text"
                value={form.libelle}
                onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Sélectionner --</option>
                  {settings.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Initial">Initial</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé(e)">Terminé(e)</option>
                  <option value="Annulé(e)">Annulé(e)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin théorique</label>
                <input type="date" value={form.date_fin_theorique} onChange={(e) => setForm({ ...form, date_fin_theorique: e.target.value })}
                  min={form.date_debut}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            {form.statut === 'Terminé(e)' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin réelle</label>
                <input type="date" value={form.date_fin_reelle} onChange={(e) => setForm({ ...form, date_fin_reelle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            )}

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
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        ) : (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Catégorie :</span> {task.categorie || '-'}</p>
            <p><span className="font-medium">Description :</span> {task.description || '-'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
