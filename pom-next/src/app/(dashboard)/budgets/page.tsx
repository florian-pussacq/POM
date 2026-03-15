'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Budget, Project, Collaborator } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { calculateTaskCost } from '@/lib/utils/dates';

export default function BudgetsListPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/budgets').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
    ]).then(([budgetsData, projectsData, collabsData]) => {
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setCollaborators(Array.isArray(collabsData) ? collabsData : []);
      setLoading(false);
    });
  }, []);

  const getConsumption = (budgetId: string, montant: number): number => {
    if (montant === 0) return 0;
    let totalCost = 0;
    for (const project of projects) {
      if (project.ligne_budgetaire?.id === budgetId) {
        for (const task of project.taches || []) {
          const collabCosts = task.collaborateurs
            .map(cId => collaborators.find(c => c._id === cId)?.cout_horaire || 0);
          totalCost += calculateTaskCost(collabCosts, task.date_debut, task.date_fin_theorique);
        }
      }
    }
    return Math.min(100, Math.round((totalCost / montant) * 100));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette ligne budgétaire ?')) return;
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
    setBudgets(budgets.filter(b => b._id !== id));
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
        <h1 className="text-2xl font-bold text-gray-900">Lignes budgétaires</h1>
        <Link
          href="/budgets/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau budget
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consommation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgets.map((budget) => {
                const consumption = getConsumption(budget._id, budget.montant);
                return (
                  <tr key={budget._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{budget.libelle}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{budget.montant.toLocaleString()} €</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{budget.description || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${consumption > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${consumption}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{consumption}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(budget._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {budgets.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune ligne budgétaire</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
