# 9. Étapes futures

## Phase 2 : Base de données PostgreSQL + Prisma

### Plan de migration

1. **Installer Prisma** :
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Créer le schéma** (`prisma/schema.prisma`) :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   model Collaborator {
     id            String    @id @default(cuid())
     nom           String
     prenom        String
     pseudo        String    @unique
     mot_de_passe  String
     email         String    @unique
     role          String    @default("collaborateur")
     fonction      String?
     cout_horaire  Float     @default(0)
     manager_id    String?
     manager       Collaborator?  @relation("ManagerSubordinates", fields: [manager_id], references: [id])
     subordinates  Collaborator[] @relation("ManagerSubordinates")
     projects      Project[]      @relation("ProjectCollaborators")
     managed_projects Project[]   @relation("ProjectManager")
     tasks         Task[]         @relation("TaskCollaborators")
     created_at    DateTime  @default(now())
     updated_at    DateTime  @updatedAt
   }

   model Project {
     id                 String    @id @default(cuid())
     nom                String
     code               String?   @unique
     chef_projet_id     String?
     chef_projet        Collaborator? @relation("ProjectManager", fields: [chef_projet_id], references: [id])
     date_debut         DateTime?
     date_fin_theorique DateTime?
     date_fin_reelle    DateTime?
     statut             String    @default("Initial")
     description        String?
     budget_id          String?
     budget             Budget?   @relation(fields: [budget_id], references: [id])
     collaborateurs     Collaborator[] @relation("ProjectCollaborators")
     taches             Task[]
     created_at         DateTime  @default(now())
     updated_at         DateTime  @updatedAt
   }

   model Task {
     id                 String    @id @default(cuid())
     libelle            String
     code               String?
     description        String?
     categorie          String?
     date_debut         DateTime?
     date_fin_theorique DateTime?
     date_fin_reelle    DateTime?
     statut             String    @default("Initial")
     projet_id          String
     projet             Project   @relation(fields: [projet_id], references: [id], onDelete: Cascade)
     collaborateurs     Collaborator[] @relation("TaskCollaborators")
     created_at         DateTime  @default(now())
     updated_at         DateTime  @updatedAt
   }

   model Budget {
     id          String    @id @default(cuid())
     libelle     String
     montant     Float
     description String?
     projects    Project[]
     created_at  DateTime  @default(now())
     updated_at  DateTime  @updatedAt
   }
   ```

3. **Adapter le store** : Remplacer `InMemoryDB` par des appels Prisma Client

4. **Créer le seed** (`prisma/seed.ts`) : Reprendre les données hardcodées

5. **Migrer** :
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

### Service PostgreSQL recommandé

- **Vercel Postgres** (intégré à Vercel)
- **Supabase** (gratuit en dev)
- **Neon** (serverless PostgreSQL)
- **Railway** (simple)

## Phase 3 : Améliorations fonctionnelles

- [ ] Notifications en temps réel (WebSocket ou Server-Sent Events)
- [ ] Export PDF/Excel des projets et statistiques
- [ ] Gantt chart pour la planification
- [ ] Tableau Kanban pour les tâches
- [ ] Module de facturation (temps passé × coût)
- [ ] Intégration email (Mailgun) pour les notifications
- [ ] Tests unitaires et E2E (Vitest + Playwright)
- [ ] CI/CD GitHub Actions
- [ ] Monitoring (Sentry)
- [ ] shadcn/ui pour les composants UI avancés

## Phase 4 : Optimisations

- [ ] Server Components pour les pages de lecture
- [ ] `use cache` pour le caching des données
- [ ] Partial Pre-rendering (PPR) pour les pages hybrides
- [ ] Optimistic UI pour les mutations
- [ ] Pagination serveur pour les listes longues
- [ ] Recherche full-text (PostgreSQL tsvector)
