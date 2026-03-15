# 3. Architecture de la nouvelle application

## Structure des dossiers

```
pom-next/
├── src/
│   ├── app/                           # App Router (routes & pages)
│   │   ├── layout.tsx                 # Root layout (providers, font)
│   │   ├── page.tsx                   # Redirect → /dashboard
│   │   ├── globals.css                # Styles globaux Tailwind
│   │   │
│   │   ├── (auth)/                    # Route group: pages publiques
│   │   │   ├── layout.tsx             # Layout centré (login/reset)
│   │   │   ├── login/page.tsx         # Page de connexion
│   │   │   └── reset-password/page.tsx # Réinitialisation MDP
│   │   │
│   │   ├── (dashboard)/               # Route group: pages protégées
│   │   │   ├── layout.tsx             # Layout avec sidebar
│   │   │   ├── dashboard/page.tsx     # Tableau de bord
│   │   │   ├── projects/              # CRUD projets
│   │   │   │   ├── page.tsx           # Liste
│   │   │   │   ├── create/page.tsx    # Création
│   │   │   │   └── [id]/             # Détail/édition
│   │   │   │       ├── page.tsx
│   │   │   │       └── tasks/        # CRUD tâches (dans projet)
│   │   │   │           ├── page.tsx
│   │   │   │           ├── create/page.tsx
│   │   │   │           └── [taskId]/page.tsx
│   │   │   ├── collaborators/         # CRUD collaborateurs
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── budgets/               # CRUD budgets
│   │   │   │   ├── page.tsx
│   │   │   │   └── create/page.tsx
│   │   │   ├── statistics/page.tsx    # Statistiques avec Chart.js
│   │   │   ├── account/page.tsx       # Profil & changement MDP
│   │   │   ├── help/page.tsx          # FAQ
│   │   │   └── restricted/page.tsx    # Page d'accès refusé
│   │   │
│   │   └── api/                       # API Routes
│   │       ├── auth/[...nextauth]/    # NextAuth handlers
│   │       ├── auth/reset-password/   # Reset password
│   │       ├── auth/change-password/  # Change password
│   │       ├── projects/              # CRUD projets
│   │       ├── projects/generate-code/ # Génération code projet
│   │       ├── projects/[id]/         # Projet par ID
│   │       ├── projects/[id]/tasks/   # CRUD tâches
│   │       ├── projects/[id]/tasks/[taskId]/ # Tâche par ID
│   │       ├── collaborators/         # CRUD collaborateurs
│   │       ├── collaborators/[id]/    # Collaborateur par ID
│   │       ├── collaborators/[id]/projects/ # Projets du collaborateur
│   │       ├── collaborators/role/[role]/ # Collaborateurs par rôle
│   │       ├── budgets/               # CRUD budgets
│   │       ├── budgets/[id]/          # Budget par ID
│   │       ├── settings/              # Configuration (roles, statuts...)
│   │       └── version/               # Version de l'API
│   │
│   ├── components/                    # Composants React
│   │   ├── layout/
│   │   │   └── sidebar.tsx            # Barre de navigation latérale
│   │   ├── ui/
│   │   │   └── badges.tsx             # Badges statut & catégorie
│   │   └── providers.tsx              # SessionProvider (NextAuth)
│   │
│   ├── lib/                           # Logique métier & utilitaires
│   │   ├── auth.ts                    # Configuration NextAuth
│   │   ├── auth-utils.ts             # Helpers d'authentification
│   │   ├── settings.ts               # Données de configuration (rôles, statuts, couleurs)
│   │   ├── data/
│   │   │   └── store.ts              # Base de données en mémoire
│   │   └── utils/
│   │       ├── dates.ts              # Utilitaires dates, codes, coûts
│   │       ├── cn.ts                 # Utilitaire classNames
│   │       └── session.ts            # Helpers session
│   │
│   └── types/                         # Types TypeScript
│       ├── index.ts                   # Types principaux (Collaborator, Project, Task, Budget)
│       └── next-auth.d.ts            # Extension types NextAuth
│
├── .env.example                       # Template variables d'environnement
├── next.config.ts                     # Configuration Next.js
├── tsconfig.json                      # Configuration TypeScript
├── tailwind.config.ts                 # Configuration Tailwind (si présent)
└── package.json                       # Dépendances
```

## Mapping Angular → Next.js

| Concept Angular | Équivalent Next.js |
|-----------------|-------------------|
| Composants standalone | Composants React (Client ou Server) |
| Signals | `useState` / `useEffect` hooks |
| Reactive Forms | Formulaires HTML + `useState` |
| Services (injectable) | Fonctions utilitaires / `fetch()` API |
| Guards (canActivate) | Middleware NextAuth / vérification côté composant |
| Interceptors (HTTP) | NextAuth session automatique |
| Lazy loading (`loadChildren`) | App Router (automatique) |
| Angular Material | Tailwind CSS + composants custom |
| `environment.ts` | `.env.local` variables d'environnement |
| Express routes | Next.js API Routes (Route Handlers) |
| Mongoose models | In-memory store (puis Prisma models) |

## Flux d'authentification

```
1. Utilisateur → /login
2. Formulaire → POST /api/auth/callback/credentials (NextAuth)
3. NextAuth → InMemoryDB.getCollaboratorByPseudo() → bcrypt.compare()
4. Succès → JWT créé → Cookie httpOnly → Redirect /dashboard
5. Chaque page → useSession() → données utilisateur disponibles
6. API Routes → auth() → vérifie le JWT → renvoie session
```
