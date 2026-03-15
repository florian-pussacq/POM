# 4. Base de données en dur (In-Memory Store)

## Approche

Pour cette première phase de migration, la base de données MongoDB est remplacée par un **store en mémoire** (`src/lib/data/store.ts`). Cela permet de :

1. Valider que l'application fonctionne correctement
2. Déployer immédiatement sans infrastructure BDD
3. Préparer la migration vers une vraie BDD plus tard

## Données initiales

### Collaborateurs (5)

| ID | Nom | Pseudo | Rôle | Mot de passe |
|----|-----|--------|------|-------------|
| collab-001 | Admin Dupont | admin | admin | admin123 |
| collab-002 | Sophie Martin | smartin | manager | manager123 |
| collab-003 | Lucas Bernard | lbernard | collaborateur | collab123 |
| collab-004 | Marie Petit | mpetit | collaborateur | collab123 |
| collab-005 | Thomas Leroy | tleroy | collaborateur | collab123 |

### Projets (4)

| ID | Nom | Code | Statut | Chef de projet |
|----|-----|------|--------|---------------|
| project-001 | Refonte POM v3 | 2024P001 | En cours | Sophie Martin |
| project-002 | Migration Cloud | 2024P002 | En cours | Sophie Martin |
| project-003 | Formation Équipe Dev | 2024P003 | Terminé(e) | Sophie Martin |
| project-004 | Optimisation Performance | 2024P004 | Initial | Admin Dupont |

### Tâches (9, embarquées dans les projets)

Projet 001 (5 tâches) : Étude, Spécifications, Dev Backend, Dev Frontend, Recette
Projet 002 (2 tâches) : Audit infrastructure, Migration serveurs
Projet 003 (2 tâches) : Formation React/Next.js, Formation TypeScript avancé

### Budgets (3)

| ID | Libellé | Montant |
|----|---------|---------|
| budget-001 | Budget R&D 2024 | 150 000 € |
| budget-002 | Budget Infrastructure | 80 000 € |
| budget-003 | Budget Formation | 30 000 € |

## Singleton Pattern

Le store utilise un pattern singleton attaché à `globalThis` pour persister les données en développement (où le hot-reload crée de nouvelles instances du module) :

```typescript
const globalForDb = globalThis as unknown as { db: InMemoryDB };
export const db = globalForDb.db || new InMemoryDB();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
```

## Limitations

- **Pas de persistance** : Les données reviennent à l'état initial au redémarrage
- **Pas de concurrence** : Un seul processus (pas de problème en serverless Vercel)
- **Mots de passe hachés** : Les mots de passe sont hachés avec bcrypt à l'initialisation

## Migration future vers PostgreSQL + Prisma

Voir [09-future-steps.md](./09-future-steps.md) pour le plan de migration vers une vraie BDD.
