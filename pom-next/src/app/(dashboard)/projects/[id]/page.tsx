'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, Collaborator, Budget, Task } from '@/types';
import { StatusBadge, CategoryBadge } from '@/components/ui/badges';
import { formatDate, dateDiffWorkingDays, toInputDate } from '@/lib/utils/dates';
import { ArrowLeft, Save, Lock, Plus, Eye, Trash2 } from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'tasks'>('info');
  const [form, setForm] = useState({
    nom: '',
    statut: '',
    date_debut: '',
    date_fin_theorique: '',
    description: '',
    budget_id: '',
    selectedCollabs: [] as string[],
  });

  const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string;
  const canEdit = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
      fetch('/api/budgets').then(r => r.json()).catch(() => []),
    ]).then(([projectData, collabsData, budgetsData]) => {
      if (projectData._id) {
        setProject(projectData);
        setForm({
          nom: projectData.nom || '',
          statut: projectData.statut || '',
          date_debut: toInputDate(projectData.date_debut),
          date_fin_theorique: toInputDate(projectData.date_fin_theorique),
          description: projectData.description || '',
          budget_id: projectData.ligne_budgetaire?.id || '',
          selectedCollabs: projectData.collaborateurs || [],
        });
      }
      setCollaborators(Array.isArray(collabsData) ? collabsData : []);
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    const budget = budgets.find(b => b._id === form.budget_id);
    
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: form.nom,
        statut: form.statut,
        date_debut: form.date_debut ? new Date(form.date_debut).toISOString() : undefined,
        date_fin_theorique: form.date_fin_theorique ? new Date(form.date_fin_theorique).toISOString() : undefined,
        description: form.description,
        collaborateurs: form.selectedCollabs,
        ligne_budgetaire: budget ? { id: budget._id, montant_restant: budget.montant } : undefined,
      }),
    });
    setSaving(false);
    router.refresh();
  };

  const handleClose = async () => {
    if (!project) return;
    const activeTasks = project.taches?.filter(t => t.statut === 'Initial' || t.statut === 'En cours') || [];
    if (activeTasks.length > 0) {
      alert('Vous devez finaliser toutes les tâches associées au projet avant de pouvoir le terminer.');
      return;
    }
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: 'Terminé(e)', date_fin_reelle: new Date().toISOString() }),
    });
    router.push('/projects');
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Supprimer cette tâche ?')) return;
    await fetch(`/api/projects/${id}/tasks/${taskId}`, { method: 'DELETE' });
    setProject(prev => prev ? { ...prev, taches: prev.taches.filter(t => t._id !== taskId) } : null);
  };

  const getCollabName = (cId: string) => {
    const c = collaborators.find(c => c._id === cId);
    return c ? `${c.prenom} ${c.nom}` : cId;
  };

  const duration = project?.date_debut && project?.date_fin_theorique
    ? dateDiffWorkingDays(project.date_debut, project.date_fin_theorique)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-12 text-gray-500">Projet introuvable</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{project.nom}</h1>
        <StatusBadge status={project.statut} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tasks' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tâches ({project.taches?.length || 0})
          </button>
        </nav>
      </div>

      {activeTab === 'info' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Code</label>
              <p className="text-gray-900 font-mono">{project.code}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Chef de projet</label>
              <p className="text-gray-900">{getCollabName(project.chef_projet || '')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Durée (jours ouvrés)</label>
              <p className="text-gray-900">{duration}</p>
            </div>
          </div>

          <hr />

          {canEdit ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="En cours">En cours</option>
                  <option value="Annulé(e)">Annulé(e)</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Ligne budgétaire</label>
                <select
                  value={form.budget_id}
                  onChange={(e) => setForm({ ...form, budget_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Sélectionner --</option>
                  {budgets.map(b => (
                    <option key={b._id} value={b._id}>{b.libelle} ({b.montant.toLocaleString()} €)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collaborateurs</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {collaborators.map(c => (
                    <label key={c._id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.selectedCollabs.includes(c._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, selectedCollabs: [...form.selectedCollabs, c._id] });
                          } else {
                            setForm({ ...form, selectedCollabs: form.selectedCollabs.filter(id => id !== c._id) });
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

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                {project.statut === 'En cours' && (
                  <button
                    onClick={handleClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Clôturer le projet
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p><span className="font-medium">Description :</span> {project.description || '-'}</p>
              <p><span className="font-medium">Collaborateurs :</span> {project.collaborateurs?.map(getCollabName).join(', ') || '-'}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {canEdit && (
            <Link
              href={`/projects/${id}/tasks/create`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouvelle tâche
            </Link>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin théo.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(project.taches || []).map((task: Task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{task.libelle}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{task.code}</td>
                      <td className="px-4 py-3">{task.categorie && <CategoryBadge category={task.categorie} />}</td>
                      <td className="px-4 py-3"><StatusBadge status={task.statut} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(task.date_debut)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(task.date_fin_theorique)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/projects/${id}/tasks/${task._id}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
                            <Eye className="h-4 w-4" />
                          </Link>
                          {canEdit && (
                            <button onClick={() => handleDeleteTask(task._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!project.taches || project.taches.length === 0) && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Aucune tâche</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
