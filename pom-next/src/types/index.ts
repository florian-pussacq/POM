// Types for POM application

export type UserRole = 'admin' | 'manager' | 'collaborateur';

export type ProjectStatus = 'Initial' | 'En cours' | 'Terminé(e)' | 'Annulé(e)' | 'Archivé';

export type TaskStatus = 'Initial' | 'En cours' | 'Terminé(e)' | 'Annulé(e)';

export type TaskCategory =
  | 'Etude de projet'
  | 'Spécification'
  | 'Développement'
  | 'Recette'
  | 'Mise en production';

export interface Collaborator {
  _id: string;
  nom: string;
  prenom: string;
  pseudo: string;
  mot_de_passe?: string;
  email: string;
  role: UserRole;
  fonction?: string;
  cout_horaire: number;
  manager?: string | null;
  date_creation: string;
  date_derniere_modif: string;
}

export interface Task {
  _id: string;
  libelle: string;
  code?: string;
  description?: string;
  categorie?: TaskCategory;
  date_debut?: string;
  date_fin_theorique?: string;
  date_fin_reelle?: string;
  statut: TaskStatus;
  projet_id?: string;
  collaborateurs: string[];
  date_creation: string;
  date_derniere_modif: string;
}

export interface Project {
  _id: string;
  nom: string;
  code?: string;
  chef_projet?: string;
  date_debut?: string;
  date_fin_theorique?: string;
  date_fin_reelle?: string;
  statut: ProjectStatus;
  collaborateurs: string[];
  ligne_budgetaire?: {
    id: string;
    montant_restant: number;
  };
  description?: string;
  taches: Task[];
  date_creation: string;
  date_derniere_modif: string;
}

export interface Budget {
  _id: string;
  libelle: string;
  montant: number;
  description?: string;
  date_creation: string;
  date_derniere_modif: string;
}

export interface Settings {
  roles: string[];
  statuts: string[];
  fonctions: string[];
  categories: string[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  collaborator?: Omit<Collaborator, 'mot_de_passe'>;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; path: string }>;
}
