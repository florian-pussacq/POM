# 6. API Routes

## Correspondance ancien → nouveau

Toutes les API routes Express ont été migrées vers des **Next.js Route Handlers** dans `src/app/api/`.

### Auth

| Méthode | Ancien | Nouveau | Notes |
|---------|--------|---------|-------|
| POST | `/api/auth/login` | `/api/auth/[...nextauth]` | Géré par NextAuth |
| POST | `/api/auth/reset-password` | `/api/auth/reset-password` | Identique |
| GET | `/api/auth/me` | via `useSession()` / `auth()` | Plus besoin d'endpoint |
| PUT | `/api/auth/change-password` | `/api/auth/change-password` | Identique |

### Projets

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/api/projects` | Tous (admin voit tout, autres voient les leurs) |
| GET | `/api/projects/generate-code` | Admin, Manager |
| GET | `/api/projects/[id]` | Tous |
| POST | `/api/projects` | Admin, Manager |
| PUT | `/api/projects/[id]` | Admin, Manager |
| DELETE | `/api/projects/[id]` | Admin, Manager |

### Tâches (embarquées dans projets)

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/api/projects/[id]/tasks` | Tous |
| GET | `/api/projects/[id]/tasks/[taskId]` | Tous |
| POST | `/api/projects/[id]/tasks` | Admin, Manager |
| PUT | `/api/projects/[id]/tasks/[taskId]` | Admin, Manager |
| DELETE | `/api/projects/[id]/tasks/[taskId]` | Admin, Manager |

### Collaborateurs

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/api/collaborators` | Admin, Manager |
| GET | `/api/collaborators/[id]` | Tous |
| GET | `/api/collaborators/[id]/projects` | Tous |
| GET | `/api/collaborators/role/[role]` | Admin, Manager |
| POST | `/api/collaborators` | Admin, Manager (manager → collaborateur seulement) |
| PUT | `/api/collaborators/[id]` | Admin, Manager |
| DELETE | `/api/collaborators/[id]` | Admin uniquement |

### Budgets

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/api/budgets` | Admin uniquement |
| GET | `/api/budgets/[id]` | Admin uniquement |
| POST | `/api/budgets` | Admin uniquement |
| PUT | `/api/budgets/[id]` | Admin uniquement |
| DELETE | `/api/budgets/[id]` | Admin uniquement |

### Settings & Version

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/api/settings` | Authentifié |
| GET | `/api/version` | Public |

## Format des réponses

Les API renvoient directement les données JSON (pas d'enveloppe `{ success, data }` sauf pour les erreurs) :

```json
// Succès (GET list)
[{ "_id": "...", "nom": "..." }, ...]

// Succès (GET single)
{ "_id": "...", "nom": "..." }

// Erreur
{ "success": false, "message": "Description de l'erreur" }
```

## Codes HTTP

| Code | Signification |
|------|--------------|
| 200 | Succès |
| 201 | Ressource créée |
| 401 | Non authentifié |
| 403 | Accès refusé (rôle insuffisant) |
| 404 | Ressource introuvable |
| 409 | Conflit (pseudo déjà utilisé) |
| 422 | Validation échouée |
| 500 | Erreur serveur |
