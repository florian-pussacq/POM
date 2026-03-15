'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { StatusBadge, CategoryBadge } from '@/components/ui/badges';
import { formatDate, dateDiffWorkingDays } from '@/lib/utils/dates';
import { Project, Task, Collaborator, Budget } from '@/types';
import { calculateTaskCost } from '@/lib/utils/dates';
import Link from 'next/link';
import { ListTodo, AlertTriangle, Clock, CheckCircle, XCircle, FolderKanban } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;
  const userName = (session?.user as unknown as Record<string, unknown>)?.prenom as string || '';

  useEffect(() => {
    if (!userId) return;
    
    Promise.all([
      fetch(`/api/collaborators/${userId}/projects`).then(r => r.json()).catch(() => []),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
      fetch('/api/budgets').then(r => r.json()).catch(() => []),
    ]).then(([projectsData, collabsData, budgetsData]) => {
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setCollaborators(Array.isArray(collabsData) ? collabsData : []);
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      setLoading(false);
    });
  }, [userId]);

  // Get all tasks from active projects that belong to the user
  const activeProjects = projects.filter(p => p.statut === 'En cours');
  const myTasks: (Task & { projectName: string; projectId: string })[] = [];
  
  for (const project of projects) {
    for (const task of project.taches || []) {
      if (task.collaborateurs?.includes(userId || '')) {
        myTasks.push({ ...task, projectName: project.nom, projectId: project._id });
      }
    }
  }

  const activeTasks = myTasks.filter(t => {
    const proj = projects.find(p => p._id === t.projectId);
    return proj?.statut === 'En cours';
  });

  const now = new Date();
  const newTasks = activeTasks.filter(t => t.statut === 'Initial');
  const urgentTasks = activeTasks.filter(t => {
    if (t.statut !== 'En cours' || !t.date_fin_theorique) return false;
    return dateDiffWorkingDays(now, new Date(t.date_fin_theorique)) <= 3;
  });
  const upcomingTasks = activeTasks.filter(t => {
    if (t.statut !== 'Initial' || !t.date_debut) return false;
    const days = dateDiffWorkingDays(now, new Date(t.date_debut));
    return days >= 1 && days <= 6;
  });
  const completedTasks = myTasks.filter(t => t.statut === 'Terminé(e)');
  const cancelledTasks = myTasks.filter(t => t.statut === 'Annulé(e)');

  // Budget progress calculation
  function getProjectProgress(project: Project): number {
    if (!project.ligne_budgetaire?.id) return 0;
    const budget = budgets.find(b => b._id === project.ligne_budgetaire?.id);
    if (!budget || budget.montant === 0) return 0;
    
    let totalCost = 0;
    for (const task of project.taches || []) {
      const collabCosts = task.collaborateurs
        .map(cId => collaborators.find(c => c._id === cId)?.cout_horaire || 0);
      totalCost += calculateTaskCost(collabCosts, task.date_debut, task.date_fin_theorique);
    }
    return Math.min(100, Math.round((totalCost / budget.montant) * 100));
  }

  const counters = [
    { label: 'Nouvelles', count: newTasks.length, icon: ListTodo, color: 'bg-blue-50 text-blue-600' },
    { label: 'Urgentes', count: urgentTasks.length, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
    { label: 'À venir', count: upcomingTasks.length, icon: Clock, color: 'bg-orange-50 text-orange-600' },
    { label: 'Terminées', count: completedTasks.length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Annulées', count: cancelledTasks.length, icon: XCircle, color: 'bg-gray-50 text-gray-600' },
    { label: 'Total', count: activeTasks.length, icon: FolderKanban, color: 'bg-purple-50 text-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bonjour, {userName} !</h1>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {counters.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className={`inline-flex p-2 rounded-lg ${c.color} mb-2`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.count}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* My Tasks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Mes tâches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin théo.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myTasks.slice(0, 10).map((task) => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link href={`/projects/${task.projectId}/tasks/${task._id}`} className="hover:text-green-600">
                      {task.libelle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{task.projectName}</td>
                  <td className="px-4 py-3">{task.categorie && <CategoryBadge category={task.categorie} />}</td>
                  <td className="px-4 py-3"><StatusBadge status={task.statut} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(task.date_debut)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(task.date_fin_theorique)}</td>
                </tr>
              ))}
              {myTasks.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucune tâche assignée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Mes projets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée (j.o.)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avancement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeProjects.map((project) => {
                const duration = project.date_debut && project.date_fin_theorique
                  ? dateDiffWorkingDays(project.date_debut, project.date_fin_theorique)
                  : 0;
                const progress = getProjectProgress(project);
                return (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/projects/${project._id}`} className="text-gray-900 hover:text-green-600 font-medium">
                        {project.nom}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{project.code}</td>
                    <td className="px-4 py-3"><StatusBadge status={project.statut} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{duration}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${progress > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {activeProjects.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucun projet en cours</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
