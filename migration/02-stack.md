# 2. Stack technique

## Next.js 16.1.6 (LTS)

- **React 19** : Dernière version stable
- **App Router** : Routing basé sur le système de fichiers
- **Turbopack** : Bundler par défaut (dev + build)
- **TypeScript 5** : Typage strict
- **Node.js 20.9+** : Requis par Next.js 16

## Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| `next` | 16.1.6 | Framework fullstack |
| `react` / `react-dom` | 19.2.3 | UI library |
| `next-auth` | 5.0.0-beta.30 | Authentification (Credentials + JWT) |
| `bcryptjs` | 3.0.3 | Hachage des mots de passe |
| `jsonwebtoken` | 9.0.3 | (Disponible si besoin) |
| `chart.js` | 4.5.1 | Graphiques |
| `react-chartjs-2` | 5.3.1 | Wrapper React pour Chart.js |
| `lucide-react` | 0.577.0 | Icônes SVG |
| `date-fns` | 4.1.0 | (Disponible pour manipulation de dates) |
| `tailwindcss` | 4.x | CSS utilitaire |

## Dépendances de développement

| Package | Usage |
|---------|-------|
| `typescript` | Typage |
| `eslint` + `eslint-config-next` | Linting |
| `@types/bcryptjs` | Types TypeScript |
| `@types/jsonwebtoken` | Types TypeScript |
| `@tailwindcss/postcss` | PostCSS plugin |

## Installation

```bash
cd pom-next
npm install
```

## Scripts

```bash
npm run dev      # Serveur de développement (localhost:3000)
npm run build    # Build de production
npm run start    # Démarrage du serveur de production
npm run lint     # Linting ESLint
```

## Variables d'environnement

Créer un fichier `.env.local` :

```bash
# NextAuth (obligatoire)
AUTH_SECRET=votre-secret-min-64-caracteres
NEXTAUTH_URL=http://localhost:3000
```

Voir `.env.example` pour le template.
