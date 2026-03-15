# 1. Vue d'ensemble de la migration

## Contexte

L'application POM (Plan, Organize & Manage) est un outil de gestion de projets d'équipe. Elle était initialement écrite en Angular 1.6 avec un serveur Express, puis migrée vers Angular 21 + Express 5 + MongoDB.

Cette migration remplace l'ensemble de la stack par **Next.js 16** (App Router), combinant le frontend et le backend dans un seul projet déployable sur **Vercel**.

## Ancien stack → Nouveau stack

| Composant | Avant | Après |
|-----------|-------|-------|
| **Frontend** | Angular 21 + Angular Material | Next.js 16 (React 19) + Tailwind CSS |
| **Backend** | Express 5 (Node.js) | Next.js API Routes (App Router) |
| **Base de données** | MongoDB + Mongoose | In-memory store (temporaire) → PostgreSQL + Prisma (futur) |
| **Authentification** | JWT custom (jsonwebtoken) | NextAuth.js v5 (Credentials + JWT session) |
| **Charts** | Chart.js (Angular wrapper) | Chart.js + react-chartjs-2 |
| **Icônes** | Angular Material Icons | Lucide React |
| **Déploiement** | Docker + docker-compose | Vercel |

## Fonctionnalités migrées

Toutes les fonctionnalités de l'application originale sont conservées :

- ✅ **Authentification** : Login, logout, réinitialisation mot de passe, changement mot de passe
- ✅ **Dashboard** : Compteurs de tâches, tableaux "Mes tâches" et "Mes projets"
- ✅ **Projets** : CRUD complet, génération de code automatique, archivage, clôture
- ✅ **Tâches** : CRUD complet (embarquées dans les projets), génération de code, catégories
- ✅ **Collaborateurs** : CRUD complet, rôles (admin/manager/collaborateur), hiérarchie
- ✅ **Budgets** : CRUD complet, calcul de consommation automatique
- ✅ **Statistiques** : Graphiques Chart.js (camemberts, barres), vue globale et zoom projet
- ✅ **Compte** : Profil utilisateur, changement de mot de passe
- ✅ **Aide** : FAQ accordéon
- ✅ **RBAC** : Contrôle d'accès basé sur les rôles (sidebar, routes, API)

## Comptes de test

| Rôle | Pseudo | Mot de passe |
|------|--------|-------------|
| Admin | `admin` | `admin123` |
| Manager | `smartin` | `manager123` |
| Collaborateur | `lbernard` | `collab123` |
