export type TaskStatus = 'Initial' | 'En cours' | 'Terminé' | 'Annulé';

export interface Task {
  _id: string;
  libelle: string;
  code?: string;
  description?: string;
  categorie?: string;
  date_debut?: string;
  date_fin_theorique?: string;
  date_fin_reelle?: string;
  statut: TaskStatus;
  projet_id?: string;
  collaborateurs?: string[];
  date_creation?: string;
  date_derniere_modif?: string;
}
