# 7. Pages et composants

## Pages de l'application

### Pages publiques (layout auth)

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Formulaire pseudo/MDP, liens vers reset, infos comptes de test |
| **Reset Password** | `/reset-password` | Formulaire de réinitialisation par pseudo |

### Pages protégées (layout dashboard avec sidebar)

| Page | Route | Rôles | Description |
|------|-------|-------|-------------|
| **Dashboard** | `/dashboard` | Tous | 6 compteurs de tâches + tableaux "Mes tâches" et "Mes projets" |
| **Projets - Liste** | `/projects` | Tous | Table triable, actions archive/suppression |
| **Projets - Création** | `/projects/create` | Admin, Manager | Formulaire avec code auto-généré |
| **Projets - Détail** | `/projects/[id]` | Tous | Onglets Info + Tâches, formulaire d'édition |
| **Tâches - Création** | `/projects/[id]/tasks/create` | Admin, Manager | Formulaire avec catégories |
| **Tâches - Détail** | `/projects/[id]/tasks/[taskId]` | Tous | Formulaire d'édition complet |
| **Collaborateurs - Liste** | `/collaborators` | Admin, Manager | Table complète avec rôles et managers |
| **Collaborateurs - Création** | `/collaborators/create` | Admin, Manager | Formulaire avec validation pseudo unique |
| **Collaborateurs - Détail** | `/collaborators/[id]` | Admin, Manager | Formulaire d'édition |
| **Budgets - Liste** | `/budgets` | Admin | Table avec barres de consommation |
| **Budgets - Création** | `/budgets/create` | Admin | Formulaire libellé/montant/description |
| **Statistiques** | `/statistics` | Tous | 2 onglets : vue globale + zoom projet |
| **Compte** | `/account` | Tous | Profil + changement de mot de passe |
| **Aide** | `/help` | Tous | FAQ accordéon (5 questions) |
| **Accès refusé** | `/restricted` | Tous | Page d'erreur de permissions |

## Composants partagés

### `Sidebar` (`components/layout/sidebar.tsx`)
- Navigation latérale responsive (mobile: drawer, desktop: fixe)
- Liens filtrés par rôle utilisateur
- Section utilisateur avec profil et déconnexion
- Indicateur de page active

### `StatusBadge` (`components/ui/badges.tsx`)
- Badge coloré pour les statuts : Initial (bleu), En cours (orange), Terminé (vert), Annulé (rouge), Archivé (gris)

### `CategoryBadge` (`components/ui/badges.tsx`)
- Badge coloré pour les catégories de tâches : Étude (rouge), Spécification (orange), Développement (bleu), Recette (jaune), Mise en production (vert)

### `Providers` (`components/providers.tsx`)
- Wrapper `SessionProvider` de NextAuth pour le côté client

## Design System

Le design utilise **Tailwind CSS** avec une palette inspirée de l'Angular Material original :

- **Couleur primaire** : Vert (`green-600` / `green-700`)
- **Couleur secondaire** : Bleu (`blue-600`)
- **Fond** : Gris clair (`gray-50`)
- **Cartes** : Blanc avec bordures grises subtiles et ombres légères
- **Police** : Inter / system-ui
- **Coins arrondis** : `rounded-lg` (8px) / `rounded-xl` (12px)

## Correspondance Angular → React

| Pattern Angular | Pattern React |
|-----------------|---------------|
| `@Component({ ... })` | `export default function Page()` |
| `signal()` / `computed()` | `useState()` / `useMemo()` |
| `effect()` | `useEffect()` |
| `[formGroup]` + `FormBuilder` | `useState` + `onChange` handlers |
| `MatTable` + `MatSort` | `<table>` HTML natif |
| `MatDialog` | `confirm()` / modals custom |
| `MatSnackBar` | `alert()` / toast custom |
| `MatSidenav` | Composant Sidebar custom avec Tailwind |
| `MatChip` | Badges custom (`StatusBadge`, `CategoryBadge`) |
| `*ngIf` / `*ngFor` | `{condition && ...}` / `{array.map(...)}` |
| `| date:'dd/MM/yyyy'` | `formatDate()` helper |
