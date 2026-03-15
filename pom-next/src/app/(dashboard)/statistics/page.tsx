'use client';

import { useEffect, useState } from 'react';
import { Project, Collaborator, Budget } from '@/types';
import { countByTerm, dateDiffWorkingDays, calculateTaskCost } from '@/lib/utils/dates';
import { STATUS_COLORS, CATEGORY_COLORS } from '@/lib/settings';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatisticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'project'>('global');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
      fetch('/api/budgets').then(r => r.json()).catch(() => []),
    ]).then(([p, c, b]) => {
      setProjects(Array.isArray(p) ? p : []);
      setCollaborators(Array.isArray(c) ? c : []);
      setBudgets(Array.isArray(b) ? b : []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Global stats
  const statusCount = countByTerm(projects, 'statut');
  const statusLabels = Object.keys(statusCount);
  const statusValues = Object.values(statusCount);
  const statusColors = statusLabels.map(s => STATUS_COLORS[s] || '#9E9E9E');

  const pieData = {
    labels: statusLabels,
    datasets: [{ data: statusValues, backgroundColor: statusColors }],
  };

  const barData = {
    labels: statusLabels,
    datasets: [{
      label: 'Projets',
      data: statusValues,
      backgroundColor: statusColors,
    }],
  };

  // Duration chart
  const durationLabels = projects.map(p => p.nom);
  const theoreticalDurations = projects.map(p =>
    p.date_debut && p.date_fin_theorique ? dateDiffWorkingDays(p.date_debut, p.date_fin_theorique) : 0
  );
  const realDurations = projects.map(p =>
    p.date_debut && p.date_fin_reelle ? dateDiffWorkingDays(p.date_debut, p.date_fin_reelle) : 0
  );

  const durationData = {
    labels: durationLabels,
    datasets: [
      { label: 'Durée théorique', data: theoreticalDurations, backgroundColor: '#2196F3' },
      { label: 'Durée réelle', data: realDurations, backgroundColor: '#4CAF50' },
    ],
  };

  // Project zoom
  const selectedProj = projects.find(p => p._id === selectedProject);
  const projTasks = selectedProj?.taches || [];

  const taskStatusCount = countByTerm(projTasks, 'statut');
  const taskCategoryCount = countByTerm(projTasks, 'categorie');

  const taskStatusPie = {
    labels: Object.keys(taskStatusCount),
    datasets: [{ data: Object.values(taskStatusCount), backgroundColor: Object.keys(taskStatusCount).map(s => STATUS_COLORS[s] || '#9E9E9E') }],
  };

  const taskCategoryPie = {
    labels: Object.keys(taskCategoryCount),
    datasets: [{ data: Object.values(taskCategoryCount), backgroundColor: Object.keys(taskCategoryCount).map(c => CATEGORY_COLORS[c] || '#9E9E9E') }],
  };

  // Budget consumption for selected project
  let budgetConsumption = 0;
  if (selectedProj?.ligne_budgetaire?.id) {
    const budget = budgets.find(b => b._id === selectedProj.ligne_budgetaire?.id);
    if (budget && budget.montant > 0) {
      let totalCost = 0;
      for (const task of projTasks) {
        const costs = task.collaborateurs.map(cId => collaborators.find(c => c._id === cId)?.cout_horaire || 0);
        totalCost += calculateTaskCost(costs, task.date_debut, task.date_fin_theorique);
      }
      budgetConsumption = Math.round((totalCost / budget.montant) * 100);
    }
  }

  const budgetPie = {
    labels: ['Consommé', 'Restant'],
    datasets: [{
      data: [budgetConsumption, Math.max(0, 100 - budgetConsumption)],
      backgroundColor: ['#F44336', '#4CAF50'],
    }],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button onClick={() => setActiveTab('global')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'global' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}>
            Vue globale
          </button>
          <button onClick={() => setActiveTab('project')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'project' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}>
            Zoom projet
          </button>
        </nav>
      </div>

      {activeTab === 'global' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Répartition des projets par statut</h3>
            <div className="h-64 flex items-center justify-center"><Pie data={pieData} /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Nombre de projets par statut</h3>
            <div className="h-64"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Durée théorique vs réelle (jours ouvrés)</h3>
            <div className="h-64"><Bar data={durationData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">-- Sélectionner un projet --</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.nom}</option>)}
          </select>

          {selectedProj && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Tâches par statut</h3>
                <div className="h-64 flex items-center justify-center">
                  {projTasks.length > 0 ? <Pie data={taskStatusPie} /> : <p className="text-gray-500">Aucune tâche</p>}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Tâches par catégorie</h3>
                <div className="h-64 flex items-center justify-center">
                  {projTasks.length > 0 ? <Pie data={taskCategoryPie} /> : <p className="text-gray-500">Aucune tâche</p>}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Consommation budget</h3>
                <div className="h-64 flex items-center justify-center"><Pie data={budgetPie} /></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
