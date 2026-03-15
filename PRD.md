# PRD – Réfonte de POM en Next.js

> **Version** : 1.0
> **Date** : Mars 2026
> **Statut** : Draft
> **Auteur** : Équipe POM

---

## Table des matières

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Périmètre fonctionnel](#2-périmètre-fonctionnel)
3. [Stack technique cible](#3-stack-technique-cible)
4. [Architecture technique](#4-architecture-technique)
5. [Modèle de données](#5-modèle-de-données)
6. [Modules fonctionnels](#6-modules-fonctionnels)
7. [API Routes (Next.js)](#7-api-routes-nextjs)
8. [Authentification & RBAC](#8-authentification--rbac)
9. [Design & UI](#9-design--ui)
10. [Déploiement sur Vercel](#10-déploiement-sur-vercel)
11. [Plan de migration](#11-plan-de-migration)
12. [Critères de succès](#12-critères-de-succès)

---

## 1. Contexte et objectifs

### 1.1 Contexte

POM (Plan, Organize & Manage) est une application web de gestion de projets interne. La version actuelle repose sur :

- **Frontend** : Angular 21 + Angular Material + Chart.js
- **Backend** : Node.js 20 + Express 5 + TypeScript
- **Base de données** : MongoDB 6+ (Mongoose 9)
- **Déploiement** : frontend sur Vercel, backend sur Render, BDD MongoDB Atlas

Cette architecture séparée (frontend + backend + BDD sur 3 plateformes distinctes) complexifie le déploiement, le monitoring et la maintenance.

### 1.2 Objectifs de la réfonte

| Objectif | Description |
|----------|-------------|
| **Unification** | Regrouper front et back dans un seul projet Next.js (App Router) |
| **Modernisation** | Utiliser les dernières pratiques React/Next.js (Server Components, Server Actions, etc.) |
| **Simplification du déploiement** | Tout déployer sur Vercel (frontend + API Routes + base de données serverless) |
| **Parité fonctionnelle** | Reproduire 100 % des fonctionnalités existantes |
| **Conservation du design** | Reproduire fidèlement le design Material actuel (couleurs, composants, layout sidebar) |
| **Performance** | Bénéficier du SSR, du code splitting automatique et du caching de Next.js |

### 1.3 Ce qui ne change pas

- Les règles métier (codes projet/tâche, calculs de coûts, jours ouvrés, etc.)
- Les rôles et permissions (admin, manager, collaborateur)
- Le modèle de données (collections, champs, relations)
- Les fonctionnalités offertes à l'utilisateur

---

## 2. Périmètre fonctionnel

Toutes les fonctionnalités de l'application existante sont conservées :

| Module | Description |
|--------|-------------|
| **Authentification** | Connexion pseudo/mot de passe, JWT, déconnexion, réinitialisation MDP |
| **Tableau de bord** | Vue personnalisée : compteurs de tâches, tâches récentes, projets du collaborateur |
| **Projets** | CRUD complet, code auto-généré, clôture, archivage, gestion collaborateurs |
| **Tâches** | CRUD embarqué dans les projets, code auto-généré, catégories, calcul de coûts |
| **Collaborateurs** | CRUD, rôles, fonctions, affectation manager |
| **Lignes budgétaires** | CRUD, calcul de consommation, association aux projets |
| **Statistiques** | Graphiques (pie, bar, stacked) : répartition statuts, durées, coûts, budget |
| **Mon profil** | Informations personnelles, changement de mot de passe |
| **Aide** | Documentation intégrée |
| **Paramétrage** | Référentiels dynamiques (rôles, statuts, catégories, fonctions) |

---

## 3. Stack technique cible

### 3.1 Framework & Runtime

| Couche | Technologie | Justification |
|--------|------------|---------------|
| **Framework** | Next.js 15 (App Router) | Full-stack React, SSR/SSG, API Routes, déploiement Vercel natif |
| **Langage** | TypeScript 5 | Typage statique, cohérence avec la version actuelle |
| **Runtime** | Node.js 20+ | Support LTS, compatible Vercel |

### 3.2 Frontend

| Besoin | Technologie | Justification |
|--------|------------|---------------|
| **UI Components** | shadcn/ui + Radix UI + Tailwind CSS | Composants accessibles, personnalisables, design proche Material |
| **Icônes** | Lucide React | Set d'icônes moderne, équivalent Material Icons |
| **Graphiques** | Chart.js + react-chartjs-2 | Même librairie que l'existant, parité visuelle |
| **Formulaires** | React Hook Form + Zod | Validation performante côté client et serveur |
| **State Management** | React Context + hooks natifs (useState, useReducer) | Suffisant pour la taille de l'application |
| **Tables de données** | @tanstack/react-table | Tables triables, filtrables, paginées |
| **Notifications** | Sonner (toast) | Équivalent MatSnackBar |
| **Date picker** | date-fns + composant shadcn date-picker | Manipulation de dates et jours ouvrés |

### 3.3 Backend (API Routes Next.js)

| Besoin | Technologie | Justification |
|--------|------------|---------------|
| **API** | Next.js Route Handlers (App Router) | API intégrée au même projet, déployée sur Vercel |
| **ORM / Base de données** | Prisma + PostgreSQL (Vercel Postgres ou Neon) | ORM moderne, type-safe, migrations automatiques, serverless-friendly |
| **Authentification** | NextAuth.js v5 (Auth.js) avec Credentials provider | Standard Next.js, gestion de sessions, compatible Vercel |
| **Hashing** | bcryptjs | Même librairie, compatibilité des hashs existants |
| **Validation** | Zod | Validation partagée front/back, type-safe |
| **Rate limiting** | Upstash Ratelimit (Redis serverless) | Compatible serverless Vercel |
| **Emails** | Resend ou Mailgun (via API HTTP) | Envoi d'emails de réinitialisation MDP |

### 3.4 Choix de la base de données : PostgreSQL via Prisma

**Pourquoi quitter MongoDB ?**

| Critère | MongoDB (actuel) | PostgreSQL (cible) |
|---------|-----------------|-------------------|
| Déploiement Vercel | Nécessite MongoDB Atlas séparé | Vercel Postgres natif (ou Neon intégré) |
| ORM type-safe | Mongoose (schéma runtime) | Prisma (schéma compilé, autocomplétion) |
| Relations | Références manuelles + populate | Relations natives (FK, joins) |
| Migrations | Manuelles | `prisma migrate` automatique |
| Serverless | Problème de connexions (pool) | Connection pooling natif (PgBouncer / Neon) |
| Intégrité référentielle | Aucune | Contraintes FK, ON DELETE CASCADE |

Le modèle de données POM est **relationnel** par nature (projets ↔ tâches ↔ collaborateurs ↔ budgets), PostgreSQL est donc un choix plus adapté.

> **Note** : Les tâches actuellement embarquées (embedded documents MongoDB) deviennent une table séparée avec une clé étrangère vers le projet. Cela ne change rien fonctionnellement, et simplifie les requêtes.

---

## 4. Architecture technique

### 4.1 Architecture monorepo Next.js

```
pom-nextjs/
├── prisma/
│   ├── schema.prisma              # Schéma de la BDD
│   ├── migrations/                # Migrations auto-générées
│   └── seed.ts                    # Données initiales (admin, settings)
├── src/
│   ├── app/                       # App Router (pages + API)
│   │   ├── (auth)/                # Route group : pages publiques
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx         # Layout minimal (sans sidebar)
│   │   ├── (dashboard)/           # Route group : pages protégées
│   │   │   ├── layout.tsx         # Layout avec sidebar + header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx       # Liste des projets
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Détail projet (onglet info)
│   │   │   │       └── tasks/
│   │   │   │           ├── page.tsx       # Liste tâches du projet
│   │   │   │           ├── create/
│   │   │   │           │   └── page.tsx
│   │   │   │           └── [taskId]/
│   │   │   │               └── page.tsx   # Détail tâche
│   │   │   ├── collaborators/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── budgets/
│   │   │   │   ├── page.tsx
│   │   │   │   └── create/
│   │   │   │       └── page.tsx
│   │   │   ├── statistics/
│   │   │   │   └── page.tsx
│   │   │   ├── account/
│   │   │   │   └── page.tsx
│   │   │   ├── help/
│   │   │   │   └── page.tsx
│   │   │   └── restricted/
│   │   │       └── page.tsx
│   │   ├── api/                   # Route Handlers (API)
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts   # NextAuth handler
│   │   │   │   ├── reset-password/
│   │   │   │   │   └── route.ts
│   │   │   │   └── change-password/
│   │   │   │       └── route.ts
│   │   │   ├── projects/
│   │   │   │   ├── route.ts       # GET (list), POST (create)
│   │   │   │   ├── generate-code/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts   # GET, PUT, DELETE
│   │   │   │       └── tasks/
│   │   │   │           ├── route.ts       # GET (list), POST (create)
│   │   │   │           └── [taskId]/
│   │   │   │               └── route.ts   # GET, PUT, DELETE
│   │   │   ├── collaborators/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── projects/
│   │   │   │   │       └── route.ts
│   │   │   │   └── role/
│   │   │   │       └── [role]/
│   │   │   │           └── route.ts
│   │   │   ├── budgets/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── settings/
│   │   │   │   └── route.ts
│   │   │   └── version/
│   │   │       └── route.ts
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Styles globaux Tailwind
│   │   └── not-found.tsx          # Page 404
│   ├── components/
│   │   ├── ui/                    # Composants shadcn/ui (Button, Card, Table, etc.)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx        # Navigation latérale
│   │   │   ├── header.tsx         # Barre de header
│   │   │   └── user-menu.tsx      # Menu utilisateur (profil, déconnexion)
│   │   ├── projects/
│   │   │   ├── project-form.tsx
│   │   │   ├── project-table.tsx
│   │   │   └── collaborator-picker.tsx
│   │   ├── tasks/
│   │   │   ├── task-form.tsx
│   │   │   └── task-table.tsx
│   │   ├── collaborators/
│   │   │   ├── collaborator-form.tsx
│   │   │   └── collaborator-table.tsx
│   │   ├── budgets/
│   │   │   ├── budget-form.tsx
│   │   │   └── budget-table.tsx
│   │   ├── statistics/
│   │   │   ├── status-pie-chart.tsx
│   │   │   ├── status-bar-chart.tsx
│   │   │   ├── duration-chart.tsx
│   │   │   ├── cost-chart.tsx
│   │   │   └── budget-chart.tsx
│   │   └── shared/
│   │       ├── status-badge.tsx   # Badge coloré pour les statuts
│   │       ├── category-badge.tsx # Badge coloré pour les catégories
│   │       ├── date-picker.tsx
│   │       ├── confirm-dialog.tsx
│   │       └── loading-spinner.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Singleton Prisma Client
│   │   ├── auth.ts                # Configuration NextAuth
│   │   ├── auth-utils.ts          # Helpers : getSession, requireAuth, requireRole
│   │   ├── validators/            # Schémas Zod
│   │   │   ├── project.ts
│   │   │   ├── task.ts
│   │   │   ├── collaborator.ts
│   │   │   ├── budget.ts
│   │   │   └── auth.ts
│   │   ├── utils/
│   │   │   ├── dates.ts           # Calcul jours ouvrés, durées
│   │   │   ├── costs.ts           # Calcul coûts tâches, avancement
│   │   │   ├── code-generator.ts  # Génération codes projet/tâche
│   │   │   └── constants.ts       # Couleurs statuts, catégories
│   │   └── settings.ts            # Référentiels (rôles, statuts, catégories, fonctions)
│   ├── hooks/
│   │   ├── use-current-user.ts    # Hook pour accéder à l'utilisateur courant
│   │   └── use-role.ts            # Hook pour vérifier le rôle
│   └── types/
│       └── index.ts               # Types TypeScript partagés
├── public/
│   └── favicon.ico
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.local                     # Variables d'environnement (local)
├── .env.example                   # Template des variables
└── README.md
```

### 4.2 Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js App Router                       │   │
│  │                                                       │   │
│  │  ┌─────────────┐     ┌──────────────────────────┐    │   │
│  │  │   Pages     │     │     API Route Handlers   │    │   │
│  │  │  (React     │────▶│    /api/projects         │    │   │
│  │  │   SSR/CSR)  │     │    /api/tasks            │    │   │
│  │  │             │     │    /api/collaborators     │    │   │
│  │  └─────────────┘     │    /api/budgets          │    │   │
│  │                       │    /api/settings         │    │   │
│  │                       └────────────┬─────────────┘    │   │
│  └────────────────────────────────────┼──────────────────┘   │
│                                       │ Prisma Client        │
│                                       ▼                      │
│                              ┌─────────────────┐             │
│                              │   PostgreSQL     │             │
│                              │  (Vercel Postgres│             │
│                              │   ou Neon)       │             │
│                              └─────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Rendu des pages

| Type de page | Stratégie de rendu | Justification |
|-------------|-------------------|---------------|
| Login, Reset password | Client Component | Formulaires interactifs |
| Dashboard | Server Component + Client Components | Chargement initial des données côté serveur |
| Listes (projets, tâches, etc.) | Server Component (data fetching) + Client Component (table interactive) | Performance SSR + interactivité table |
| Formulaires (create/edit) | Client Component | Interactivité formulaire, validation temps réel |
| Statistiques | Client Component | Chart.js nécessite le DOM (canvas) |
| Aide | Server Component | Contenu statique |

---

## 5. Modèle de données

### 5.1 Schéma Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")    // Pour les migrations (connexion directe, sans pooler)
}

// ─── Collaborateur (utilisateur) ────────────────────────────

model Collaborator {
  id             String   @id @default(cuid())
  nom            String
  prenom         String
  pseudo         String   @unique
  email          String   @unique
  motDePasse     String   @map("mot_de_passe")
  role           Role     @default(COLLABORATEUR)
  fonction       String?
  coutHoraire    Float    @default(0) @map("cout_horaire")
  managerId      String?  @map("manager_id")
  dateCreation   DateTime @default(now()) @map("date_creation")
  dateDerniereModif DateTime @updatedAt @map("date_derniere_modif")

  // Relations
  manager        Collaborator?  @relation("ManagerRelation", fields: [managerId], references: [id])
  managedUsers   Collaborator[] @relation("ManagerRelation")
  chefDeProjet   Project[]      @relation("ChefDeProjet")
  projets        ProjectCollaborator[]
  taches         TaskCollaborator[]

  @@map("collaborators")
}

enum Role {
  ADMIN        @map("admin")
  MANAGER      @map("manager")
  COLLABORATEUR @map("collaborateur")

  @@map("roles")
}

// ─── Projet ─────────────────────────────────────────────────

model Project {
  id                String    @id @default(cuid())
  nom               String
  code              String?   @unique
  description       String?
  statut            ProjectStatus @default(INITIAL)
  dateDebut         DateTime? @map("date_debut")
  dateFinTheorique  DateTime? @map("date_fin_theorique")
  dateFinReelle     DateTime? @map("date_fin_reelle")
  chefProjetId      String?   @map("chef_projet_id")
  budgetId          String?   @map("budget_id")
  montantRestant    Float?    @map("montant_restant")
  dateCreation      DateTime  @default(now()) @map("date_creation")
  dateDerniereModif DateTime  @updatedAt @map("date_derniere_modif")

  // Relations
  chefProjet     Collaborator?        @relation("ChefDeProjet", fields: [chefProjetId], references: [id])
  budget         Budget?              @relation(fields: [budgetId], references: [id])
  collaborateurs ProjectCollaborator[]
  taches         Task[]

  @@map("projects")
}

enum ProjectStatus {
  INITIAL      @map("Initial")
  EN_COURS     @map("En cours")
  TERMINE      @map("Terminé(e)")
  ANNULE       @map("Annulé(e)")
  ARCHIVE      @map("Archivé")

  @@map("project_statuses")
}

// ─── Tâche ──────────────────────────────────────────────────

model Task {
  id                String       @id @default(cuid())
  libelle           String
  code              String?
  description       String?
  categorie         TaskCategory?
  statut            TaskStatus   @default(INITIAL)
  dateDebut         DateTime?    @map("date_debut")
  dateFinTheorique  DateTime?    @map("date_fin_theorique")
  dateFinReelle     DateTime?    @map("date_fin_reelle")
  projetId          String       @map("projet_id")
  dateCreation      DateTime     @default(now()) @map("date_creation")
  dateDerniereModif DateTime     @updatedAt @map("date_derniere_modif")

  // Relations
  projet         Project            @relation(fields: [projetId], references: [id], onDelete: Cascade)
  collaborateurs TaskCollaborator[]

  @@map("tasks")
}

enum TaskStatus {
  INITIAL      @map("Initial")
  EN_COURS     @map("En cours")
  TERMINE      @map("Terminé(e)")
  ANNULE       @map("Annulé(e)")

  @@map("task_statuses")
}

enum TaskCategory {
  ETUDE_PROJET       @map("Etude de projet")
  SPECIFICATION      @map("Spécification")
  DEVELOPPEMENT      @map("Développement")
  RECETTE            @map("Recette")
  MISE_EN_PRODUCTION @map("Mise en production")

  @@map("task_categories")
}

// ─── Ligne budgétaire ───────────────────────────────────────

model Budget {
  id                String   @id @default(cuid())
  libelle           String
  montant           Float
  description       String?
  dateCreation      DateTime @default(now()) @map("date_creation")
  dateDerniereModif DateTime @updatedAt @map("date_derniere_modif")

  // Relations
  projets        Project[]

  @@map("budgets")
}

// ─── Tables de liaison ──────────────────────────────────────

model ProjectCollaborator {
  projectId      String @map("project_id")
  collaboratorId String @map("collaborator_id")

  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  collaborator Collaborator @relation(fields: [collaboratorId], references: [id], onDelete: Cascade)

  @@id([projectId, collaboratorId])
  @@map("project_collaborators")
}

model TaskCollaborator {
  taskId         String @map("task_id")
  collaboratorId String @map("collaborator_id")

  task         Task         @relation(fields: [taskId], references: [id], onDelete: Cascade)
  collaborator Collaborator @relation(fields: [collaboratorId], references: [id], onDelete: Cascade)

  @@id([taskId, collaboratorId])
  @@map("task_collaborators")
}
```

### 5.2 Mapping MongoDB → PostgreSQL

| MongoDB (actuel) | PostgreSQL (cible) | Notes |
|------------------|--------------------|-------|
| Collection `collaborateurs` | Table `collaborators` | Même structure, `_id` → `id` (cuid) |
| Collection `projects` avec `taches` embarquées | Tables `projects` + `tasks` séparées | Relation FK `tasks.projet_id → projects.id` |
| `collaborateurs[]` (array d'ObjectId) | Table de liaison `project_collaborators` | Relation many-to-many explicite |
| `collaborateurs[]` dans tâches | Table de liaison `task_collaborators` | Relation many-to-many explicite |
| Collection `budgets` | Table `budgets` | Même structure |
| `ligne_budgetaire: { id, montant_restant }` | Champs `budget_id` + `montant_restant` dans `projects` | Relation FK vers `budgets` |

---

## 6. Modules fonctionnels

### 6.1 Authentification

| Fonctionnalité | Comportement | Implémentation Next.js |
|---------------|-------------|----------------------|
| Connexion | Pseudo + mot de passe → session JWT | NextAuth Credentials provider, session JWT |
| Déconnexion | Suppression de la session | `signOut()` de NextAuth |
| Réinitialisation MDP | Génération MDP aléatoire + envoi email | API Route `/api/auth/reset-password` |
| Changement MDP | Vérification ancien MDP + hash nouveau | API Route `/api/auth/change-password` |
| Profil courant | Données du collaborateur connecté | `getServerSession()` + query Prisma |
| Protection des routes | Middleware Next.js | `middleware.ts` avec NextAuth + matchers |

### 6.2 Tableau de bord

| Élément | Description | Données |
|---------|-------------|---------|
| Message de bienvenue | "Bonjour, {Prénom} !" | Session utilisateur |
| Compteurs de tâches | Nouvelles, Urgentes, À venir, Terminées, Annulées, Total | Tâches du collaborateur dans les projets "En cours" |
| Tableau des tâches | Libellé, catégorie (badge couleur), statut (badge couleur), dates | Tâches du collaborateur (paginées, 10/page) |
| Tableau des projets | Nom, chef de projet, statut, durée (jours ouvrés), progression (%) | Projets auxquels le collaborateur est affecté |

**Calculs :**
- Tâches urgentes : `date_fin_theorique` ≤ 3 jours ouvrés à partir d'aujourd'hui
- Tâches à venir : `date_debut` dans 1 à 6 jours ouvrés
- Durée : jours ouvrés entre `date_debut` et `date_fin_theorique` (hors samedi/dimanche)
- Progression : `(coût total tâches / montant ligne budgétaire) × 100`

### 6.3 Projets

#### Liste des projets
- **Colonnes** : Nom, Code, Chef de projet, Statut (badge couleur), Date début, Date fin théorique, Actions
- **Filtrage** par rôle : admin voit tous les projets, manager/collaborateur voient seulement les projets auxquels ils sont affectés
- **Pagination** : 10 éléments par page
- **Actions** : Voir détail, Archiver (admin/manager), Supprimer (admin/manager)

#### Création de projet
- **Accès** : admin, manager
- **Champs** : Nom (requis), Date début (requis), Date fin théorique (requis, ≥ date début), Description, Ligne budgétaire (select), Collaborateurs (sélection multiple via dialog)
- **Code auto** : Format `{ANNÉE}P{NNN}` (ex: `2026P001`). Algorithme : récupérer les projets de l'année en cours, incrémenter le dernier numéro
- **Comportement** : Le créateur est automatiquement chef de projet et ajouté aux collaborateurs. Statut initial = "Initial"

#### Détail / Modification de projet
- **Structure en onglets** :
  - **Onglet Info** : Formulaire d'édition (nom, statut, dates, budget, collaborateurs, description) + infos en lecture seule (code, chef de projet, durée)
  - **Onglet Tâches** : Liste des tâches du projet avec actions CRUD
- **Clôture** : Bouton "Clôturer" → vérifie que toutes les tâches sont "Terminé(e)" ou "Annulé(e)" → passe en "Terminé(e)" avec `date_fin_reelle = now()`
- **Archivage** : Même pré-condition que la clôture → passe en "Archivé"

#### Statuts projet
| Statut | Couleur |
|--------|---------|
| Initial | Bleu (#2196F3) |
| En cours | Orange (#FF9800) |
| Terminé(e) | Vert (#4CAF50) |
| Annulé(e) | Rouge (#F44336) |
| Archivé | Gris (#9E9E9E) |

### 6.4 Tâches

#### Liste des tâches (par projet)
- **Colonnes** : Libellé, Code, Catégorie (badge couleur), Statut (badge couleur), Date début, Date fin théorique, Actions
- **Actions** : Voir détail, Supprimer (admin/manager)

#### Création de tâche
- **Accès** : admin, manager
- **Champs** : Libellé (requis), Catégorie (select, requis), Description, Date début (requis, ≥ date début projet), Date fin théorique (requis, ≤ date fin théorique projet), Collaborateurs (sélection parmi les collaborateurs du projet)
- **Code auto** : Format `{CODE_PROJET}T{NNN}` (ex: `2026P001T001`)
- **Statut initial** : "Initial"

#### Détail / Modification de tâche
- **Champs modifiables** : Libellé, Description, Statut, Date début, Date fin théorique, Date fin réelle (seulement si statut = "Terminé(e)"), Collaborateurs
- **Règle** : `date_fin_reelle` n'est saisie que lorsque le statut passe à "Terminé(e)"

#### Catégories de tâches
| Catégorie | Couleur |
|-----------|---------|
| Etude de projet | Rouge (#F44336) |
| Spécification | Orange (#FF9800) |
| Développement | Bleu (#2196F3) |
| Recette | Jaune (#FFC107) |
| Mise en production | Vert (#4CAF50) |

#### Calcul du coût d'une tâche
```
coût_total = Σ (cout_horaire[collaborateur_i] × 7 × durée_jours_ouvrés)
```
- `durée_jours_ouvrés` = nombre de jours ouvrés entre `date_debut` et `date_fin_theorique`
- `cout_horaire` = champ `cout_horaire` du collaborateur (€/h)
- `7` = heures par jour de travail

### 6.5 Collaborateurs

#### Liste des collaborateurs
- **Accès** : admin, manager
- **Colonnes** : Nom complet, Pseudo, Email, Fonction, Rôle, Manager, Actions
- **Actions** : Voir/Modifier, Supprimer (admin uniquement)

#### Création de collaborateur
- **Accès** : admin, manager
- **Champs** : Prénom (requis), Nom (requis), Pseudo (requis, unique), Email (requis, unique), Mot de passe (requis, ≥ 8 caractères), Rôle (select), Fonction (select), Coût horaire (number, ≥ 0), Manager (select)
- **Règles par rôle créateur** :
  - Admin : peut créer manager et collaborateur (pas admin)
  - Manager : peut créer collaborateur uniquement, manager = lui-même automatiquement

#### Fonctions disponibles
Développeur, Architecte, Directeur, Chef(fe) de projet technique, Analyste-Programmeur, Consultant(e), Administrateur réseaux, Leader Technique, Administrateur Base de données, Webmaster, Expert BI, Chef(fe) de projet fonctionnel, Expert ProLog

### 6.6 Lignes budgétaires

#### Liste des budgets
- **Accès** : admin uniquement
- **Colonnes** : Libellé, Montant (€), Description, Consommation (%), Actions
- **Calcul consommation** : `(coût total tâches des projets liés / montant ligne) × 100`

#### Création de budget
- **Champs** : Libellé (requis), Montant (requis, ≥ 0), Description

### 6.7 Statistiques

Page avec **2 onglets**, utilisant des graphiques Chart.js (via `react-chartjs-2`) :

#### Onglet 1 – Vue globale
| Graphique | Type | Données |
|-----------|------|---------|
| Répartition projets par statut | Pie chart | Tous les projets, comptés par statut |
| Nombre de projets par statut | Bar chart | Même données en colonnes |
| Durée théorique vs réelle | Bar chart groupé | Pour chaque projet : durée théorique et durée réelle en jours ouvrés |
| Statut des tâches par projet | Bar chart horizontal empilé | Pour chaque projet : nombre de tâches par statut |

#### Onglet 2 – Zoom sur un projet
L'utilisateur sélectionne un projet dans un menu déroulant.

| Graphique | Type | Données |
|-----------|------|---------|
| Répartition tâches par statut | Pie chart | Tâches du projet sélectionné, par statut |
| Tâches par statut | Bar chart | Même données en colonnes |
| Coût des tâches | Pie chart | Coût de chaque tâche du projet |
| Consommation budget | Pie chart | % du budget consommé vs restant |
| Durée théorique vs réelle des tâches | Bar chart groupé | Pour chaque tâche : durée théorique et durée réelle |
| Répartition par catégorie | Bar chart | Nombre de tâches par catégorie |

### 6.8 Mon profil (Account)

- Informations personnelles en lecture seule (nom, prénom, pseudo, email, rôle, fonction, manager)
- Formulaire de changement de mot de passe (mot de passe actuel + nouveau mot de passe ≥ 8 caractères)

### 6.9 Page d'aide

Documentation intégrée organisée par thème.

### 6.10 Page Restricted

Message "Accès refusé" affiché quand l'utilisateur n'a pas le rôle requis pour accéder à une page.

---

## 7. API Routes (Next.js)

Les API Routes Next.js (Route Handlers) remplacent les routes Express. Elles sont déployées comme des fonctions serverless sur Vercel.

### 7.1 Authentification

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| POST | `/api/auth/[...nextauth]` | ❌ | public | NextAuth handler (login/session) |
| POST | `/api/auth/reset-password` | ❌ | public | Réinitialisation MDP |
| PUT | `/api/auth/change-password` | ✅ | tous | Changer son MDP |

### 7.2 Projets

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| GET | `/api/projects` | ✅ | tous | Liste des projets |
| POST | `/api/projects` | ✅ | admin, manager | Créer un projet |
| GET | `/api/projects/generate-code` | ✅ | admin, manager | Générer le prochain code projet |
| GET | `/api/projects/[id]` | ✅ | tous | Détail d'un projet |
| PUT | `/api/projects/[id]` | ✅ | admin, manager | Modifier un projet |
| DELETE | `/api/projects/[id]` | ✅ | admin, manager | Supprimer un projet |

### 7.3 Tâches

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| GET | `/api/projects/[id]/tasks` | ✅ | tous | Liste des tâches d'un projet |
| POST | `/api/projects/[id]/tasks` | ✅ | admin, manager | Créer une tâche |
| GET | `/api/projects/[id]/tasks/[taskId]` | ✅ | tous | Détail d'une tâche |
| PUT | `/api/projects/[id]/tasks/[taskId]` | ✅ | admin, manager | Modifier une tâche |
| DELETE | `/api/projects/[id]/tasks/[taskId]` | ✅ | admin, manager | Supprimer une tâche |

### 7.4 Collaborateurs

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| GET | `/api/collaborators` | ✅ | admin, manager | Liste des collaborateurs |
| POST | `/api/collaborators` | ✅ | admin, manager | Créer un collaborateur |
| GET | `/api/collaborators/[id]` | ✅ | tous | Détail d'un collaborateur |
| PUT | `/api/collaborators/[id]` | ✅ | admin, manager | Modifier un collaborateur |
| DELETE | `/api/collaborators/[id]` | ✅ | admin | Supprimer un collaborateur |
| GET | `/api/collaborators/[id]/projects` | ✅ | tous | Projets d'un collaborateur |
| GET | `/api/collaborators/role/[role]` | ✅ | admin, manager | Collaborateurs par rôle |

### 7.5 Budgets

| Méthode | Route | Auth | Rôle | Description |
|---------|-------|------|------|-------------|
| GET | `/api/budgets` | ✅ | admin | Liste des budgets |
| POST | `/api/budgets` | ✅ | admin | Créer un budget |
| GET | `/api/budgets/[id]` | ✅ | admin | Détail d'un budget |
| PUT | `/api/budgets/[id]` | ✅ | admin | Modifier un budget |
| DELETE | `/api/budgets/[id]` | ✅ | admin | Supprimer un budget |

### 7.6 Paramétrage & Version

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/settings` | ✅ | Tout le paramétrage (rôles, statuts, catégories, fonctions) |
| GET | `/api/version` | ❌ | Version de l'API (health check) |

### 7.7 Validation des entrées

Tous les endpoints de création et modification utilisent des schémas **Zod** pour valider les données entrantes :

```typescript
// Exemple : validation d'un projet
const createProjectSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  dateDebut: z.string().datetime().optional(),
  dateFinTheorique: z.string().datetime().optional(),
  description: z.string().optional(),
  budgetId: z.string().optional(),
  collaborateurs: z.array(z.string()).optional(),
});
```

### 7.8 Format des réponses

**Succès :**
```json
{ "success": true, "data": { ... } }
```

**Erreur :**
```json
{ "success": false, "message": "Description de l'erreur" }
```

**Erreur de validation :**
```json
{ "success": false, "errors": [{ "path": "email", "message": "Email invalide" }] }
```

**Codes HTTP :** 200 (succès), 201 (créé), 401 (non authentifié), 403 (accès refusé), 404 (introuvable), 409 (conflit), 422 (validation échouée), 429 (rate limit), 500 (erreur serveur)

---

## 8. Authentification & RBAC

### 8.1 NextAuth.js v5 (Auth.js)

Configuration dans `src/lib/auth.ts` :

```typescript
// Credentials provider
// - Accepte pseudo + mot_de_passe
// - Vérifie le hash bcrypt en base
// - Retourne { id, pseudo, role, nom, prenom } dans le token JWT
// - Session strategy: "jwt" (pas de session DB)
```

**Token JWT :**
- Payload : `{ id, role, pseudo, nom, prenom }`
- Durée : 8 heures (configurable)
- Stockage : cookie HttpOnly sécurisé (géré par NextAuth, plus sûr que localStorage)

> **Amélioration vs version actuelle** : Le token est stocké dans un cookie HttpOnly au lieu de localStorage, ce qui protège contre les attaques XSS.

### 8.2 Middleware Next.js

Le fichier `middleware.ts` à la racine du projet protège les routes :

```typescript
// - Routes publiques : /login, /reset-password, /api/auth/*, /api/version
// - Routes protégées : toutes les autres → redirection vers /login si pas de session
// - Rate limiting via Upstash Redis (optionnel)
```

### 8.3 Contrôle d'accès par rôle (RBAC)

Matrice des permissions conservée à l'identique :

| Fonctionnalité | admin | manager | collaborateur |
|----------------|-------|---------|---------------|
| Tableau de bord | ✅ | ✅ | ✅ |
| Voir tous les projets | ✅ | ❌ (ses projets) | ❌ (ses projets) |
| Créer/modifier un projet | ✅ | ✅ | ❌ |
| Archiver/clôturer un projet | ✅ | ✅ | ❌ |
| Supprimer un projet | ✅ | ✅ | ❌ |
| Voir les tâches | ✅ | ✅ | ✅ (ses projets) |
| Créer/modifier/supprimer une tâche | ✅ | ✅ | ❌ |
| Voir les collaborateurs | ✅ | ✅ | ❌ |
| Créer un collaborateur | ✅ | ✅ (rôle collaborateur uniquement) | ❌ |
| Modifier un collaborateur | ✅ | ✅ (son équipe) | ❌ |
| Supprimer un collaborateur | ✅ | ❌ | ❌ |
| CRUD budgets | ✅ | ❌ | ❌ |
| Statistiques | ✅ | ✅ | ✅ |
| Mon profil | ✅ | ✅ | ✅ |

### 8.4 Helpers côté serveur

```typescript
// lib/auth-utils.ts

// getSession() → { user: { id, role, pseudo, nom, prenom } } | null
// requireAuth() → session ou throw 401
// requireRole(...roles) → session ou throw 403
```

---

## 9. Design & UI

### 9.1 Objectif design

Reproduire fidèlement le design Material existant en utilisant **shadcn/ui** + **Tailwind CSS** :

- **Palette de couleurs** : Primaire vert (proche du vert Material), accent bleu
- **Typographie** : Inter (alternative moderne à Roboto, très proche visuellement)
- **Layout** : Sidebar de navigation à gauche + zone de contenu principale
- **Composants** : Cards, Tables, Formulaires, Badges, Dialogs, Tabs, DatePicker
- **Icônes** : Lucide React (style cohérent avec shadcn/ui)
- **Mode sombre** : Non prévu dans la v1, mais facilement ajoutables avec shadcn/ui (bonus)

### 9.2 Layout principal

```
┌─────────────────────────────────────────────────────┐
│  Header : Logo POM + nom utilisateur + menu compte  │
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │         Zone de contenu                   │
│          │                                           │
│ • Dashboard   │   (Pages dynamiques)                 │
│ • Projets     │                                      │
│ • Collab.     │                                      │
│ • Budgets     │                                      │
│ • Stats       │                                      │
│ • Aide        │                                      │
│          │                                           │
│──────────│                                           │
│ Déconnexion   │                                      │
├──────────┴──────────────────────────────────────────┤
```

- **Sidebar** : Navigation par items avec icônes Lucide, items conditionnels selon le rôle (Budgets visible uniquement pour admin, Collaborateurs pour admin/manager)
- **Responsive** : Sidebar en drawer sur mobile (hamburger menu)
- **Header** : Logo POM, nom de l'utilisateur connecté, menu déroulant (Mon profil, Déconnexion)

### 9.3 Correspondance des composants

| Angular Material (actuel) | shadcn/ui (cible) |
|--------------------------|-------------------|
| `mat-toolbar` | Header custom avec Tailwind |
| `mat-sidenav` | Sidebar component (Sheet pour mobile) |
| `mat-nav-list` | Navigation menu avec Button variants |
| `mat-table` + `mat-paginator` | `@tanstack/react-table` + composant Table shadcn |
| `mat-card` | Card component |
| `mat-form-field` + `mat-input` | Input component |
| `mat-select` | Select component |
| `mat-datepicker` | DatePicker (Popover + Calendar) |
| `mat-tabs` | Tabs component |
| `mat-chips` | Badge component |
| `mat-dialog` | Dialog component |
| `mat-button` | Button component (variants: default, outline, ghost) |
| `mat-icon` | Lucide React icons |
| `mat-progress-spinner` | Loading spinner custom |
| `mat-snack-bar` | Sonner toast |

### 9.4 Codes couleur

#### Statuts
| Statut | Couleur Tailwind | Hex |
|--------|-----------------|-----|
| Initial | `bg-blue-100 text-blue-800` | #2196F3 |
| En cours | `bg-orange-100 text-orange-800` | #FF9800 |
| Terminé(e) | `bg-green-100 text-green-800` | #4CAF50 |
| Annulé(e) | `bg-red-100 text-red-800` | #F44336 |
| Archivé | `bg-gray-100 text-gray-800` | #9E9E9E |

#### Catégories de tâches
| Catégorie | Couleur Tailwind | Hex |
|-----------|-----------------|-----|
| Etude de projet | `bg-red-100 text-red-800` | #F44336 |
| Spécification | `bg-orange-100 text-orange-800` | #FF9800 |
| Développement | `bg-blue-100 text-blue-800` | #2196F3 |
| Recette | `bg-yellow-100 text-yellow-800` | #FFC107 |
| Mise en production | `bg-green-100 text-green-800` | #4CAF50 |

### 9.5 Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Formulaire centré : pseudo + mot de passe + bouton connexion + lien reset |
| Réinitialisation MDP | `/reset-password` | Formulaire centré : pseudo + bouton envoyer |
| Dashboard | `/dashboard` | Cards compteurs + tableau tâches + tableau projets |
| Liste projets | `/projects` | Tableau avec actions, bouton "Nouveau projet" |
| Créer projet | `/projects/create` | Formulaire dans une Card |
| Détail projet | `/projects/[id]` | Tabs (Info + Tâches) |
| Liste tâches | `/projects/[id]/tasks` | Tableau dans l'onglet Tâches du projet |
| Créer tâche | `/projects/[id]/tasks/create` | Formulaire dans une Card |
| Détail tâche | `/projects/[id]/tasks/[taskId]` | Formulaire dans une Card |
| Liste collaborateurs | `/collaborators` | Tableau avec actions |
| Créer collaborateur | `/collaborators/create` | Formulaire dans une Card |
| Détail collaborateur | `/collaborators/[id]` | Formulaire dans une Card |
| Liste budgets | `/budgets` | Tableau avec consommation % |
| Créer budget | `/budgets/create` | Formulaire dans une Card |
| Statistiques | `/statistics` | 2 onglets avec graphiques Chart.js |
| Mon profil | `/account` | Infos personnelles + changement MDP |
| Aide | `/help` | Documentation statique |
| Accès refusé | `/restricted` | Message d'erreur |

---

## 10. Déploiement sur Vercel

### 10.1 Architecture de déploiement

```
┌──────────────────────────────────────────────────────┐
│                      Vercel                           │
│                                                       │
│  ┌────────────────┐  ┌────────────────────────────┐  │
│  │  Pages SSR/    │  │  API Routes (serverless     │  │
│  │  Static        │  │  functions)                 │  │
│  │  /dashboard    │  │  /api/projects              │  │
│  │  /projects     │  │  /api/collaborators         │  │
│  │  /login        │  │  /api/budgets               │  │
│  │  ...           │  │  /api/auth                  │  │
│  └────────────────┘  └──────────┬─────────────────┘  │
│                                  │                    │
│                      ┌───────────▼──────────────┐    │
│                      │   Vercel Postgres (Neon)  │    │
│                      │   ou Neon directement     │    │
│                      └──────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

> **Avantage majeur** : Tout est sur Vercel. Plus besoin de Render pour le backend ni de MongoDB Atlas pour la BDD.

### 10.2 Variables d'environnement Vercel

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL avec connection pooling (ex: Neon pooler) |
| `DIRECT_URL` | ✅ | URL PostgreSQL directe (pour les migrations Prisma) |
| `NEXTAUTH_SECRET` | ✅ | Secret pour signer les sessions NextAuth (min 64 caractères) |
| `NEXTAUTH_URL` | ✅ | URL publique de l'app (ex: `https://pom.vercel.app`) |
| `RESEND_API_KEY` | ❌ | Clé API Resend pour l'envoi d'emails |
| `EMAIL_FROM` | ❌ | Email expéditeur (ex: `noreply@pom.app`) |
| `UPSTASH_REDIS_REST_URL` | ❌ | URL Redis Upstash pour le rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | Token Redis Upstash |

### 10.3 Configuration Next.js

```typescript
// next.config.ts
const nextConfig = {
  // Pas de rewrites nécessaire : les API Routes sont dans le même projet
  // Prisma : nécessaire pour le déploiement serverless
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
};
```

### 10.4 Procédure de déploiement

1. **Créer le projet sur Vercel** : Importer le repo GitHub
2. **Configurer Vercel Postgres** : Onglet Storage → créer une base PostgreSQL → les variables `DATABASE_URL` et `DIRECT_URL` sont auto-configurées
3. **Ajouter les variables d'environnement** : `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, et optionnellement les variables pour les emails et le rate limiting
4. **Déployer** : Push sur `main` → build automatique → `prisma generate` + `prisma migrate deploy` + `next build`
5. **Seed initial** : Exécuter `npx prisma db seed` une fois pour créer le compte admin initial

### 10.5 Scripts package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

### 10.6 Seed de la base de données

Le script de seed (`prisma/seed.ts`) crée :

1. Un compte **admin** initial :
   - Pseudo : `admin`
   - Mot de passe : `admin123` (hashé bcrypt)
   - Rôle : `admin`
2. Les référentiels ne nécessitent pas de seed (ils sont définis dans le code via `lib/settings.ts` et les enums Prisma)

---

## 11. Plan de migration

### 11.1 Phases de développement

| Phase | Description | Durée estimée |
|-------|-------------|---------------|
| **Phase 1 – Setup** | Init Next.js, Prisma, NextAuth, Tailwind, shadcn/ui | 1 jour |
| **Phase 2 – Base de données** | Schéma Prisma, migrations, seed | 1 jour |
| **Phase 3 – Auth** | NextAuth Credentials, middleware, protection des routes | 1 jour |
| **Phase 4 – Layout** | Sidebar, Header, routing, pages de base | 1 jour |
| **Phase 5 – API Routes** | Tous les endpoints (projets, tâches, collaborateurs, budgets, settings) | 2-3 jours |
| **Phase 6 – Pages CRUD** | Dashboard, Projets, Tâches, Collaborateurs, Budgets | 3-4 jours |
| **Phase 7 – Statistiques** | Graphiques Chart.js, calculs | 1-2 jours |
| **Phase 8 – Finitions** | Account, Help, Restricted, validation, gestion d'erreurs | 1 jour |
| **Phase 9 – Tests** | Tests unitaires et d'intégration | 1-2 jours |
| **Phase 10 – Déploiement** | Configuration Vercel, migration des données, recette | 1 jour |

**Total estimé : 12-16 jours**

### 11.2 Migration des données

Si des données existantes doivent être conservées :

1. Exporter les données MongoDB via `mongoexport` (JSON)
2. Créer un script de migration TypeScript (`scripts/migrate-data.ts`) qui :
   - Lit les fichiers JSON exportés
   - Transforme les ObjectId en cuid
   - Crée un mapping ancien_id → nouveau_id
   - Insère les données dans PostgreSQL via Prisma
   - Vérifie l'intégrité des relations
3. Vérification : comparer les comptages et les données entre les deux bases

### 11.3 Mapping des identifiants

| MongoDB | PostgreSQL |
|---------|-----------|
| `ObjectId` (24 chars hex) | `cuid` (25 chars alphanumeric) |
| `_id` | `id` |

Un tableau de correspondance est maintenu pendant la migration pour résoudre les références (chef de projet, collaborateurs, budgets, etc.).

---

## 12. Critères de succès

### 12.1 Fonctionnels

- [ ] Toutes les fonctionnalités de l'application actuelle sont présentes et fonctionnelles
- [ ] Les règles métier sont identiques (codes auto, calculs de coûts, jours ouvrés, etc.)
- [ ] Les permissions RBAC sont respectées (admin, manager, collaborateur)
- [ ] Les formulaires ont les mêmes validations (champs requis, formats, contraintes)
- [ ] Les graphiques statistiques affichent les mêmes données avec les mêmes couleurs

### 12.2 Techniques

- [ ] Application déployée et fonctionnelle sur Vercel
- [ ] Base de données PostgreSQL accessible et performante
- [ ] Authentification sécurisée (JWT en cookie HttpOnly)
- [ ] API Routes répondent correctement avec les bons codes HTTP
- [ ] Temps de chargement initial < 2 secondes
- [ ] Application responsive (desktop + mobile)

### 12.3 Qualité

- [ ] Code TypeScript strict (no `any`, types exhaustifs)
- [ ] Validation Zod sur tous les endpoints
- [ ] Gestion d'erreurs cohérente (messages français)
- [ ] Tests unitaires sur les utilitaires (dates, coûts, codes)
- [ ] Tests d'intégration sur les API Routes critiques (auth, projets)

### 12.4 Design

- [ ] Layout sidebar fidèle à l'original
- [ ] Codes couleur des statuts et catégories identiques
- [ ] Tableaux de données paginés et filtrables
- [ ] Formulaires avec feedback de validation en temps réel
- [ ] Graphiques Chart.js avec les mêmes types et couleurs
