/**
 * In-memory data store for POM application.
 * This replaces the MongoDB database with hardcoded data.
 * A real database will be added later.
 */

import { Collaborator, Project, Budget, Task } from '@/types';
import bcryptjs from 'bcryptjs';

// --- Password hashes ---
const adminHash = bcryptjs.hashSync('admin123', 12);
const managerHash = bcryptjs.hashSync('manager123', 12);
const collabHash = bcryptjs.hashSync('collab123', 12);

// --- Collaborators ---
const collaborators: Collaborator[] = [
  {
    _id: 'collab-001',
    nom: 'Dupont',
    prenom: 'Admin',
    pseudo: 'admin',
    mot_de_passe: adminHash,
    email: 'admin@pom.fr',
    role: 'admin',
    fonction: 'Directeur',
    cout_horaire: 100,
    manager: null,
    date_creation: '2024-01-01T00:00:00.000Z',
    date_derniere_modif: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'collab-002',
    nom: 'Martin',
    prenom: 'Sophie',
    pseudo: 'smartin',
    mot_de_passe: managerHash,
    email: 'sophie.martin@pom.fr',
    role: 'manager',
    fonction: 'Chef(fe) de projet technique',
    cout_horaire: 80,
    manager: 'collab-001',
    date_creation: '2024-01-15T00:00:00.000Z',
    date_derniere_modif: '2024-01-15T00:00:00.000Z',
  },
  {
    _id: 'collab-003',
    nom: 'Bernard',
    prenom: 'Lucas',
    pseudo: 'lbernard',
    mot_de_passe: collabHash,
    email: 'lucas.bernard@pom.fr',
    role: 'collaborateur',
    fonction: 'Développeur',
    cout_horaire: 60,
    manager: 'collab-002',
    date_creation: '2024-02-01T00:00:00.000Z',
    date_derniere_modif: '2024-02-01T00:00:00.000Z',
  },
  {
    _id: 'collab-004',
    nom: 'Petit',
    prenom: 'Marie',
    pseudo: 'mpetit',
    mot_de_passe: collabHash,
    email: 'marie.petit@pom.fr',
    role: 'collaborateur',
    fonction: 'Analyste-Programmeur',
    cout_horaire: 55,
    manager: 'collab-002',
    date_creation: '2024-02-15T00:00:00.000Z',
    date_derniere_modif: '2024-02-15T00:00:00.000Z',
  },
  {
    _id: 'collab-005',
    nom: 'Leroy',
    prenom: 'Thomas',
    pseudo: 'tleroy',
    mot_de_passe: collabHash,
    email: 'thomas.leroy@pom.fr',
    role: 'collaborateur',
    fonction: 'Architecte',
    cout_horaire: 75,
    manager: 'collab-002',
    date_creation: '2024-03-01T00:00:00.000Z',
    date_derniere_modif: '2024-03-01T00:00:00.000Z',
  },
];

// --- Budgets ---
const budgets: Budget[] = [
  {
    _id: 'budget-001',
    libelle: 'Budget R&D 2024',
    montant: 150000,
    description: 'Budget principal pour les projets de recherche et développement',
    date_creation: '2024-01-01T00:00:00.000Z',
    date_derniere_modif: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'budget-002',
    libelle: 'Budget Infrastructure',
    montant: 80000,
    description: 'Budget pour les projets d\'infrastructure et migration',
    date_creation: '2024-01-15T00:00:00.000Z',
    date_derniere_modif: '2024-01-15T00:00:00.000Z',
  },
  {
    _id: 'budget-003',
    libelle: 'Budget Formation',
    montant: 30000,
    description: 'Budget dédié à la formation de l\'équipe',
    date_creation: '2024-02-01T00:00:00.000Z',
    date_derniere_modif: '2024-02-01T00:00:00.000Z',
  },
];

// --- Tasks (embedded in projects) ---
const tasksProject1: Task[] = [
  {
    _id: 'task-001',
    libelle: 'Étude des besoins',
    code: '2024P001T001',
    description: 'Analyse et recueil des besoins utilisateurs',
    categorie: 'Etude de projet',
    date_debut: '2024-03-01T00:00:00.000Z',
    date_fin_theorique: '2024-03-15T00:00:00.000Z',
    date_fin_reelle: '2024-03-14T00:00:00.000Z',
    statut: 'Terminé(e)',
    projet_id: 'project-001',
    collaborateurs: ['collab-003', 'collab-005'],
    date_creation: '2024-03-01T00:00:00.000Z',
    date_derniere_modif: '2024-03-14T00:00:00.000Z',
  },
  {
    _id: 'task-002',
    libelle: 'Spécifications techniques',
    code: '2024P001T002',
    description: 'Rédaction des spécifications techniques détaillées',
    categorie: 'Spécification',
    date_debut: '2024-03-18T00:00:00.000Z',
    date_fin_theorique: '2024-04-05T00:00:00.000Z',
    date_fin_reelle: '2024-04-03T00:00:00.000Z',
    statut: 'Terminé(e)',
    projet_id: 'project-001',
    collaborateurs: ['collab-005'],
    date_creation: '2024-03-18T00:00:00.000Z',
    date_derniere_modif: '2024-04-03T00:00:00.000Z',
  },
  {
    _id: 'task-003',
    libelle: 'Développement du backend',
    code: '2024P001T003',
    description: 'Implémentation de l\'API REST et des services',
    categorie: 'Développement',
    date_debut: '2024-04-08T00:00:00.000Z',
    date_fin_theorique: '2024-05-31T00:00:00.000Z',
    statut: 'En cours',
    projet_id: 'project-001',
    collaborateurs: ['collab-003', 'collab-004'],
    date_creation: '2024-04-08T00:00:00.000Z',
    date_derniere_modif: '2024-04-08T00:00:00.000Z',
  },
  {
    _id: 'task-004',
    libelle: 'Développement du frontend',
    code: '2024P001T004',
    description: 'Implémentation de l\'interface utilisateur',
    categorie: 'Développement',
    date_debut: '2024-04-15T00:00:00.000Z',
    date_fin_theorique: '2024-06-15T00:00:00.000Z',
    statut: 'En cours',
    projet_id: 'project-001',
    collaborateurs: ['collab-004'],
    date_creation: '2024-04-15T00:00:00.000Z',
    date_derniere_modif: '2024-04-15T00:00:00.000Z',
  },
  {
    _id: 'task-005',
    libelle: 'Tests de recette',
    code: '2024P001T005',
    description: 'Tests fonctionnels et validation',
    categorie: 'Recette',
    date_debut: '2024-06-17T00:00:00.000Z',
    date_fin_theorique: '2024-07-05T00:00:00.000Z',
    statut: 'Initial',
    projet_id: 'project-001',
    collaborateurs: ['collab-003'],
    date_creation: '2024-06-17T00:00:00.000Z',
    date_derniere_modif: '2024-06-17T00:00:00.000Z',
  },
];

const tasksProject2: Task[] = [
  {
    _id: 'task-006',
    libelle: 'Audit infrastructure existante',
    code: '2024P002T001',
    description: 'Audit complet de l\'infrastructure cloud actuelle',
    categorie: 'Etude de projet',
    date_debut: '2024-04-01T00:00:00.000Z',
    date_fin_theorique: '2024-04-15T00:00:00.000Z',
    date_fin_reelle: '2024-04-12T00:00:00.000Z',
    statut: 'Terminé(e)',
    projet_id: 'project-002',
    collaborateurs: ['collab-005'],
    date_creation: '2024-04-01T00:00:00.000Z',
    date_derniere_modif: '2024-04-12T00:00:00.000Z',
  },
  {
    _id: 'task-007',
    libelle: 'Migration des serveurs',
    code: '2024P002T002',
    description: 'Migration vers la nouvelle infrastructure cloud',
    categorie: 'Mise en production',
    date_debut: '2024-04-16T00:00:00.000Z',
    date_fin_theorique: '2024-05-30T00:00:00.000Z',
    statut: 'En cours',
    projet_id: 'project-002',
    collaborateurs: ['collab-005', 'collab-003'],
    date_creation: '2024-04-16T00:00:00.000Z',
    date_derniere_modif: '2024-04-16T00:00:00.000Z',
  },
];

const tasksProject3: Task[] = [
  {
    _id: 'task-008',
    libelle: 'Formation React/Next.js',
    code: '2024P003T001',
    description: 'Formation de l\'équipe sur React et Next.js',
    categorie: 'Etude de projet',
    date_debut: '2024-05-01T00:00:00.000Z',
    date_fin_theorique: '2024-05-10T00:00:00.000Z',
    date_fin_reelle: '2024-05-10T00:00:00.000Z',
    statut: 'Terminé(e)',
    projet_id: 'project-003',
    collaborateurs: ['collab-003', 'collab-004'],
    date_creation: '2024-05-01T00:00:00.000Z',
    date_derniere_modif: '2024-05-10T00:00:00.000Z',
  },
  {
    _id: 'task-009',
    libelle: 'Formation TypeScript avancé',
    code: '2024P003T002',
    description: 'Formation TypeScript avancé pour l\'équipe de développement',
    categorie: 'Etude de projet',
    date_debut: '2024-05-13T00:00:00.000Z',
    date_fin_theorique: '2024-05-17T00:00:00.000Z',
    date_fin_reelle: '2024-05-17T00:00:00.000Z',
    statut: 'Terminé(e)',
    projet_id: 'project-003',
    collaborateurs: ['collab-003', 'collab-004', 'collab-005'],
    date_creation: '2024-05-13T00:00:00.000Z',
    date_derniere_modif: '2024-05-17T00:00:00.000Z',
  },
];

// --- Projects ---
const projects: Project[] = [
  {
    _id: 'project-001',
    nom: 'Refonte POM v3',
    code: '2024P001',
    chef_projet: 'collab-002',
    date_debut: '2024-03-01T00:00:00.000Z',
    date_fin_theorique: '2024-07-31T00:00:00.000Z',
    statut: 'En cours',
    collaborateurs: ['collab-002', 'collab-003', 'collab-004', 'collab-005'],
    ligne_budgetaire: { id: 'budget-001', montant_restant: 150000 },
    description: 'Migration complète de l\'application POM vers Next.js',
    taches: tasksProject1,
    date_creation: '2024-03-01T00:00:00.000Z',
    date_derniere_modif: '2024-03-01T00:00:00.000Z',
  },
  {
    _id: 'project-002',
    nom: 'Migration Cloud',
    code: '2024P002',
    chef_projet: 'collab-002',
    date_debut: '2024-04-01T00:00:00.000Z',
    date_fin_theorique: '2024-06-30T00:00:00.000Z',
    statut: 'En cours',
    collaborateurs: ['collab-002', 'collab-005', 'collab-003'],
    ligne_budgetaire: { id: 'budget-002', montant_restant: 80000 },
    description: 'Migration de l\'infrastructure vers le cloud',
    taches: tasksProject2,
    date_creation: '2024-04-01T00:00:00.000Z',
    date_derniere_modif: '2024-04-01T00:00:00.000Z',
  },
  {
    _id: 'project-003',
    nom: 'Formation Équipe Dev',
    code: '2024P003',
    chef_projet: 'collab-002',
    date_debut: '2024-05-01T00:00:00.000Z',
    date_fin_theorique: '2024-05-31T00:00:00.000Z',
    date_fin_reelle: '2024-05-17T00:00:00.000Z',
    statut: 'Terminé(e)',
    collaborateurs: ['collab-002', 'collab-003', 'collab-004', 'collab-005'],
    ligne_budgetaire: { id: 'budget-003', montant_restant: 30000 },
    description: 'Programme de formation pour l\'équipe de développement',
    taches: tasksProject3,
    date_creation: '2024-05-01T00:00:00.000Z',
    date_derniere_modif: '2024-05-17T00:00:00.000Z',
  },
  {
    _id: 'project-004',
    nom: 'Optimisation Performance',
    code: '2024P004',
    chef_projet: 'collab-001',
    date_debut: '2024-06-01T00:00:00.000Z',
    date_fin_theorique: '2024-09-30T00:00:00.000Z',
    statut: 'Initial',
    collaborateurs: ['collab-001', 'collab-003'],
    ligne_budgetaire: { id: 'budget-001', montant_restant: 150000 },
    description: 'Optimisation des performances de l\'application',
    taches: [],
    date_creation: '2024-06-01T00:00:00.000Z',
    date_derniere_modif: '2024-06-01T00:00:00.000Z',
  },
];

// --- In-memory database ---
class InMemoryDB {
  private collaborators: Collaborator[] = [...collaborators];
  private projects: Project[] = [...projects];
  private budgets: Budget[] = [...budgets];

  // --- Collaborators ---
  getCollaborators(): Omit<Collaborator, 'mot_de_passe'>[] {
    return this.collaborators.map(({ mot_de_passe: _, ...rest }) => rest);
  }

  getCollaboratorById(id: string): Omit<Collaborator, 'mot_de_passe'> | null {
    const c = this.collaborators.find(c => c._id === id);
    if (!c) return null;
    const { mot_de_passe: _, ...rest } = c;
    return rest;
  }

  getCollaboratorByPseudo(pseudo: string): Collaborator | null {
    return this.collaborators.find(c => c.pseudo.toLowerCase() === pseudo.toLowerCase()) || null;
  }

  getCollaboratorsByRole(role: string): Omit<Collaborator, 'mot_de_passe'>[] {
    return this.collaborators
      .filter(c => c.role === role)
      .map(({ mot_de_passe: _, ...rest }) => rest);
  }

  createCollaborator(data: Partial<Collaborator> & { mot_de_passe: string }): Omit<Collaborator, 'mot_de_passe'> {
    const now = new Date().toISOString();
    const newCollab: Collaborator = {
      _id: 'collab-' + Date.now().toString(36),
      nom: data.nom || '',
      prenom: data.prenom || '',
      pseudo: data.pseudo || '',
      mot_de_passe: data.mot_de_passe,
      email: data.email || '',
      role: data.role || 'collaborateur',
      fonction: data.fonction,
      cout_horaire: data.cout_horaire || 0,
      manager: data.manager || null,
      date_creation: now,
      date_derniere_modif: now,
    };
    this.collaborators.push(newCollab);
    const { mot_de_passe: _, ...rest } = newCollab;
    return rest;
  }

  updateCollaborator(id: string, data: Partial<Collaborator>): Omit<Collaborator, 'mot_de_passe'> | null {
    const idx = this.collaborators.findIndex(c => c._id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.collaborators[idx] = {
      ...this.collaborators[idx],
      ...data,
      _id: id,
      date_derniere_modif: now,
    };
    const { mot_de_passe: _, ...rest } = this.collaborators[idx];
    return rest;
  }

  updateCollaboratorPassword(id: string, hashedPassword: string): boolean {
    const idx = this.collaborators.findIndex(c => c._id === id);
    if (idx === -1) return false;
    this.collaborators[idx].mot_de_passe = hashedPassword;
    this.collaborators[idx].date_derniere_modif = new Date().toISOString();
    return true;
  }

  deleteCollaborator(id: string): boolean {
    const idx = this.collaborators.findIndex(c => c._id === id);
    if (idx === -1) return false;
    this.collaborators.splice(idx, 1);
    return true;
  }

  // --- Projects ---
  getProjects(): Project[] {
    return this.projects;
  }

  getProjectById(id: string): Project | null {
    return this.projects.find(p => p._id === id) || null;
  }

  getProjectsByCollaborator(collabId: string): Project[] {
    return this.projects.filter(p => p.collaborateurs.includes(collabId));
  }

  createProject(data: Partial<Project>): Project {
    const now = new Date().toISOString();
    const newProject: Project = {
      _id: 'project-' + Date.now().toString(36),
      nom: data.nom || '',
      code: data.code,
      chef_projet: data.chef_projet,
      date_debut: data.date_debut,
      date_fin_theorique: data.date_fin_theorique,
      statut: 'Initial',
      collaborateurs: data.collaborateurs || [],
      ligne_budgetaire: data.ligne_budgetaire,
      description: data.description,
      taches: [],
      date_creation: now,
      date_derniere_modif: now,
    };
    this.projects.push(newProject);
    return newProject;
  }

  updateProject(id: string, data: Partial<Project>): Project | null {
    const idx = this.projects.findIndex(p => p._id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.projects[idx] = {
      ...this.projects[idx],
      ...data,
      _id: id,
      taches: data.taches || this.projects[idx].taches,
      date_derniere_modif: now,
    };
    return this.projects[idx];
  }

  deleteProject(id: string): boolean {
    const idx = this.projects.findIndex(p => p._id === id);
    if (idx === -1) return false;
    this.projects.splice(idx, 1);
    return true;
  }

  // --- Tasks (embedded in projects) ---
  getTasksForProject(projectId: string): Task[] {
    const project = this.getProjectById(projectId);
    return project?.taches || [];
  }

  getTaskById(projectId: string, taskId: string): Task | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;
    return project.taches.find(t => t._id === taskId) || null;
  }

  createTask(projectId: string, data: Partial<Task>): Task | null {
    const idx = this.projects.findIndex(p => p._id === projectId);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const newTask: Task = {
      _id: 'task-' + Date.now().toString(36),
      libelle: data.libelle || '',
      code: data.code,
      description: data.description,
      categorie: data.categorie,
      date_debut: data.date_debut,
      date_fin_theorique: data.date_fin_theorique,
      statut: 'Initial',
      projet_id: projectId,
      collaborateurs: data.collaborateurs || [],
      date_creation: now,
      date_derniere_modif: now,
    };
    this.projects[idx].taches.push(newTask);
    this.projects[idx].date_derniere_modif = now;
    return newTask;
  }

  updateTask(projectId: string, taskId: string, data: Partial<Task>): Task | null {
    const pIdx = this.projects.findIndex(p => p._id === projectId);
    if (pIdx === -1) return null;
    const tIdx = this.projects[pIdx].taches.findIndex(t => t._id === taskId);
    if (tIdx === -1) return null;
    const now = new Date().toISOString();
    this.projects[pIdx].taches[tIdx] = {
      ...this.projects[pIdx].taches[tIdx],
      ...data,
      _id: taskId,
      date_derniere_modif: now,
    };
    this.projects[pIdx].date_derniere_modif = now;
    return this.projects[pIdx].taches[tIdx];
  }

  deleteTask(projectId: string, taskId: string): boolean {
    const pIdx = this.projects.findIndex(p => p._id === projectId);
    if (pIdx === -1) return false;
    const tIdx = this.projects[pIdx].taches.findIndex(t => t._id === taskId);
    if (tIdx === -1) return false;
    this.projects[pIdx].taches.splice(tIdx, 1);
    this.projects[pIdx].date_derniere_modif = new Date().toISOString();
    return true;
  }

  // --- Budgets ---
  getBudgets(): Budget[] {
    return this.budgets;
  }

  getBudgetById(id: string): Budget | null {
    return this.budgets.find(b => b._id === id) || null;
  }

  createBudget(data: Partial<Budget>): Budget {
    const now = new Date().toISOString();
    const newBudget: Budget = {
      _id: 'budget-' + Date.now().toString(36),
      libelle: data.libelle || '',
      montant: data.montant || 0,
      description: data.description,
      date_creation: now,
      date_derniere_modif: now,
    };
    this.budgets.push(newBudget);
    return newBudget;
  }

  updateBudget(id: string, data: Partial<Budget>): Budget | null {
    const idx = this.budgets.findIndex(b => b._id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.budgets[idx] = {
      ...this.budgets[idx],
      ...data,
      _id: id,
      date_derniere_modif: now,
    };
    return this.budgets[idx];
  }

  deleteBudget(id: string): boolean {
    const idx = this.budgets.findIndex(b => b._id === id);
    if (idx === -1) return false;
    this.budgets.splice(idx, 1);
    return true;
  }

  // --- Utility: get all project codes ---
  getAllProjectCodes(): string[] {
    return this.projects.map(p => p.code).filter(Boolean) as string[];
  }
}

// Singleton instance
const globalForDb = globalThis as unknown as { db: InMemoryDB };
export const db = globalForDb.db || new InMemoryDB();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
