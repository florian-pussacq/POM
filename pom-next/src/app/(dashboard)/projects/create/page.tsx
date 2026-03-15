'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Budget, Collaborator } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function ProjectCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    date_debut: '',
    date_fin_theorique: '',
    description: '',
    budget_id: '',
    selectedCollabs: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/projects/generate-code').then(r => r.json()),
      fetch('/api/budgets').then(r => r.json()).catch(() => []),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
    ]).then(([codeData, budgetsData, collabsData]) => {
      setCode(codeData.code || '');
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      setCollaborators(Array.isArray(collabsData) ? collabsData : []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const budget = budgets.find(b => b._id === form.budget_id);

    const body = {
      nom: form.nom,
      code,
      date_debut: form.date_debut ? new Date(form.date_debut).toISOString() : undefined,
      date_fin_theorique: form.date_fin_theorique ? new Date(form.date_fin_theorique).toISOString() : undefined,
      description: form.description || undefined,
      collaborateurs: form.selectedCollabs,
      ligne_budgetaire: budget ? { id: budget._id, montant_restant: budget.montant } : undefined,
    };

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push('/projects');
    } else {
      setLoading(false);
      alert('Erreur lors de la création du projet');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau projet</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input type="text" value={code} disabled className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
            <input
              type="date"
              value={form.date_debut}
              onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin théorique *</label>
            <input
              type="date"
              value={form.date_fin_theorique}
              onChange={(e) => setForm({ ...form, date_fin_theorique: e.target.value })}
              required
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
                {c.prenom} {c.nom} ({c.role})
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
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Création...' : 'Créer le projet'}
        </button>
      </form>
    </div>
  );
}
