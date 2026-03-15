import { Settings } from '@/types';

export const settings: Settings = {
  roles: ['admin', 'manager', 'collaborateur'],
  statuts: ['Initial', 'En cours', 'Terminé(e)', 'Annulé(e)', 'Archivé'],
  fonctions: [
    'Développeur',
    'Architecte',
    'Directeur',
    'Chef(fe) de projet technique',
    'Analyste-Programmeur',
    'Consultant(e)',
    'Administrateur réseaux',
    'Leader Technique',
    'Administrateur Base de données',
    'Webmaster',
    'Expert BI',
    'Chef(fe) de projet fonctionnel',
    'Expert ProLog',
  ],
  categories: [
    'Etude de projet',
    'Spécification',
    'Développement',
    'Recette',
    'Mise en production',
  ],
};

export const STATUS_COLORS: Record<string, string> = {
  'Initial': '#2196F3',
  'En cours': '#FF9800',
  'Terminé(e)': '#4CAF50',
  'Annulé(e)': '#F44336',
  'Archivé': '#9E9E9E',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Etude de projet': '#F44336',
  'Spécification': '#FF9800',
  'Développement': '#2196F3',
  'Recette': '#FFEB3B',
  'Mise en production': '#4CAF50',
};
