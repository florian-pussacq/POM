# POM – Plan, Organize & Manage (v2)

> **Branche de migration :** `migration-avec-ia`

---

## Plan de Migration Détaillé (PMD)

### Contexte & Objectifs

| Axe | Ancienne version (v1) | Nouvelle version (v2) |
|---|---|---|
| Framework client | AngularJS 1.5 (EOL 2021) | **Angular 21** |
| Build client | Grunt + Bower | **Angular CLI** |
| Framework serveur | Express 4.0 | **Express 5.x** |
| ODM | Mongoose 4.x | **Mongoose 9.x** |
| Auth | localStorage sans token | **JWT (jsonwebtoken 9)** |
| Sécurité headers | aucun | **Helmet 8** |
| Rate limiting | aucun | **express-rate-limit 8** |
| Validation entrées | aucune | **express-validator 7** |
| Hachage MDP | bcryptjs 2.3 (vulnérable) | **bcryptjs 3.0** |
| Variables d'env | config.json en clair | **dotenv** |
| CORS | `*` (tout autorisé) | **liste blanche configurable** |
| Secrets dans le code | ✗ clé API Mailgun exposée | ✓ `.env` (exclu du dépôt) |
| TypeScript | ✗ | ✓ strict mode |
| Tests | aucun | Jasmine + Karma (Angular CLI) |

---

### Phase 1 – Backend (`server-v2/`)

#### 1.1 – Dépendances modernisées

```
express@5          bcryptjs@3       jsonwebtoken@9
mongoose@9         helmet@8         express-rate-limit@8
express-validator@7 morgan@1        dotenv@17       cors@2
```

#### 1.2 – Authentification JWT

* `POST /api/auth/login` → vérifie le couple pseudo / mot_de_passe, retourne un **Bearer token** (durée configurable, défaut 8 h).
* `GET  /api/auth/me` → retourne le profil de l'utilisateur authentifié.
* `PUT  /api/auth/change-password` → changement de mot de passe sécurisé (vérifie l'ancien).
* `POST /api/auth/reset-password` → réinitialisation par email (n'expose pas l'existence du compte).
* Le middleware `authMiddleware` valide le token sur **toutes** les routes protégées.
* Le middleware `requireRole(...roles)` contrôle l'accès par rôle.

#### 1.3 – Sécurité serveur

| Mesure | Détail |
|---|---|
| Headers HTTP | `helmet()` ajoute Content-Security-Policy, X-Frame-Options, etc. |
| Rate limiting | 200 req/15 min global ; 20 req/15 min sur `/api/auth/*` |
| CORS strict | Liste blanche via `CORS_ORIGINS` dans `.env` |
| Validation | `express-validator` sur tous les endpoints (body + params) |
| Hachage | `bcrypt.hash(password, 12)` – facteur de coût élevé |
| Secrets | **Aucun secret** dans le code source → `.env` (exclu par `.gitignore`) |
| NoSQL injection | Mongoose 9 + validation stricte des ObjectId |
| Erreurs | Handler global masque les détails en production |

#### 1.4 – Configuration (`.env.example`)

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dbPOM
JWT_SECRET=<secret_aléatoire_≥64_chars>
JWT_EXPIRES_IN=8h
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
CORS_ORIGINS=http://localhost:4200
```

---

### Phase 2 – Frontend Angular 21 (`client-ng/`)

#### 2.1 – Architecture

```
client-ng/src/app/
├── core/
│   ├── guards/         # authGuard, roleGuard, publicGuard
│   ├── interceptors/   # authInterceptor (Bearer token)
│   ├── models/         # interfaces TypeScript (Collaborator, Project, Task, Budget)
│   └── services/       # AuthService, ProjectService, CollaboratorService, BudgetService
├── features/
│   ├── auth/           # LoginComponent, ResetPasswordComponent
│   ├── projects/       # list, create, detail
│   ├── collaborators/  # list, create, detail
│   ├── budgets/        # list, create
│   ├── account/        # AccountComponent (profil + changement MDP)
│   ├── statistics/     # StatisticsComponent
│   └── help/           # HelpComponent
└── shared/
    └── components/
        ├── layout/     # LayoutComponent (sidenav + toolbar)
        └── restricted/ # RestrictedComponent (403)
```

#### 2.2 – Patterns Angular modernes utilisés

| Pattern | Usage |
|---|---|
| **Standalone components** | Tous les composants (pas de NgModule) |
| **Angular Signals** | État réactif : `signal()`, `computed()` |
| **Lazy loading** | Chaque feature chargée à la demande |
| **Functional guards** | `authGuard`, `roleGuard`, `publicGuard` |
| **Functional interceptors** | `authInterceptor` injecte le Bearer token |
| **Angular Material 21** | UI cohérente et accessible |
| **Reactive Forms** | Validation côté client |
| **Control flow** | `@if`, `@for` (nouvelle syntaxe Angular 17+) |
| **TypeScript strict** | Types explicites, pas de `any` implicite |

#### 2.3 – Authentification côté client

1. `LoginComponent` appelle `AuthService.login()`.
2. Le token JWT est stocké dans `localStorage` (clé `pom_jwt`).
3. `authInterceptor` ajoute `Authorization: Bearer <token>` à chaque requête HTTP.
4. `authGuard` protège toutes les routes authentifiées.
5. `roleGuard('admin')` protège les routes réservées à certains rôles.
6. `AuthService` expose des `signal()` : `currentUser`, `isAuthenticated`, `userRole`.
7. À la déconnexion, le token et le profil sont supprimés du localStorage.

---

### Phase 3 – Sécurité & qualité

| Problème v1 | Solution v2 |
|---|---|
| Clé API Mailgun dans `collaborators.js` | Variable d'env `MAILGUN_API_KEY` |
| CORS `*` | CORS liste blanche |
| Pas d'auth sur les routes API | `authMiddleware` obligatoire |
| Pas de rate limiting | `express-rate-limit` global + strict sur auth |
| Mongoose 4.x (vulnérabilités) | Mongoose 9.x |
| Express 4.0 (obsolète) | Express 5.x |
| Token stocké sans expiration | JWT avec `JWT_EXPIRES_IN` |
| Mot de passe dans la réponse API | `select: false` + `toJSON` transform |
| AngularJS 1.x (nombreuses CVE) | Angular 21 |

---

## Installation & démarrage (v2)

### Prérequis
- Node.js ≥ 20
- MongoDB ≥ 6
- Angular CLI (`npm install -g @angular/cli`)

### Backend

```bash
cd server-v2
cp .env.example .env        # Remplir les valeurs
npm install
npm start                   # ou: npm run dev  (rechargement auto)
```

### Frontend

```bash
cd client-ng
npm install
ng serve                    # http://localhost:4200
```

### Build production

```bash
cd client-ng
ng build                    # Sortie dans dist/client-ng
```

---

## Structure du dépôt

```
POM/
├── client/          # Ancienne app AngularJS (conservée pour référence)
├── client-ng/       # ✅ Nouvelle app Angular 21
├── server/          # Ancien backend Express (conservé pour référence)
├── server-v2/       # ✅ Nouveau backend Express 5 + JWT
└── README.md
```

---

## Première connexion

Créez un premier compte admin directement dans MongoDB (une fois le serveur démarré) :

```js
// mongosh
use dbPOM
db.collaborateurs.insertOne({
  nom: "Admin",
  prenom: "Super",
  pseudo: "admin",
  mot_de_passe: "<bcrypt hash de votre mot de passe>",
  email: "admin@example.com",
  role: "admin"
})
```

Ou utilisez le script de seed fourni dans `data/` avec la commande `loadDataset.bat`.


Les instructions d'installations ont été vérifiés pour Windows.
Nous ne pouvons pas vous garantir que les mêmes manipulations fonctionneront correctement
sous un système UNIX.
 
## Pré requis :
	- NodeJS
	- MongoDB avec une instance du service démarrée
	- Git (Optionnel : Si vous voulez récupérer les sources via Github)

[Lien NodeJS téléchargement](https://nodejs.org/en/)

[Lien MongoDB documentation d'installation](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)

[Lien GIT téléchargement](https://git-scm.com/download/win)

# 1. Installation et lancement simplifié de POM

## IMPORTANT
###### Avant de commencer, veuillez vérifier que le répertoire du projet POM et le répertoire d'installation de MongoDB soit sur le même disque, en général le disque C et que le chemin du projet ne contient pas d'espaces.

## Installation :	
- Lancer le fichier setup.bat pour installer POM, le serveur et tous leurs composants

## Chargement de la base de données de démo :
- Lancer le fichier loadDataset.bat, une nouvelle base de données de POM se charge

## Lancement du serveur (API) et du client (POM) :
- Lancer le fichier launch.bat

##### Deux invités de commandes doivent s'ouvrir et lancer l'application dans votre navigateur favori
##### Vous pouvez maintenant accéder à l'application via l'URL suivante : [POM](http://localhost:9000)

## Première connexion
Vous pouvez utiliser le compte suivant pour vour connecter la premiere fois à l'application :

    Pseudo : admin
    Mot de passe : password

A partir de ce compte, vous pouvez accéder à tous les autres comptes collaborateurs.

Chaque collaborateurs possèdent le mot de passe 'password'.

## (Optionnel) Mise à jour des composants de POM
- Lancer le fichier update.bat

# 2. Installation et lancement manuel de POM
	
## Installation :
###### Dans client :
	npm install (peut prendre du temps)
	bower install

###### Dans server :
	npm install (peut prendre du temps)
		
## Lancement du serveur (API) :
###### Dans server :
	npm start
		
Si toutes les commande précédentes se sont bien passées, vous êtes normalement connecté en local à la base de données MongoDB sur le port 27017.

L'API est également lancée en local et écoute sur le port 3000.
	
Dans la console, vous devriez voir :
```
$ npm start

> pom-api@0.0.1 start C:\Users\FlorianXPS\Desktop\Projet TDA\TEST INSTALLATION\POM\server
> node ./app.js

Server listening at http://localhost:3000/
Connection successful at http://localhost:27017/dbPOM
```
	
## Lancement du client :
###### Dans client :
	grunt serve
		
Comme pour le serveur, si tout s'est bien passé, l'application POM est lancé sur le port 9000 en local sur votre ordinateur dans votre navigateur favori.
	
Dans la console, vous devriez voir quelque chose de similaire : 
```
$ grunt serve
Running "serve" task

Running "clean:server" (clean) task
>> 0 paths cleaned.

Running "wiredep:app" (wiredep) task

Running "concurrent:server" (concurrent) task

Running "copy:styles" (copy) task
Copied 3 files

Done, without errors.


Execution Time (2016-05-15 12:46:44 UTC)
loading tasks               208ms  ████████████████████████ 69%
loading grunt-contrib-copy   60ms  ███████ 20%
copy:styles                  33ms  ████ 11%
Total 302ms

Running "postcss:server" (postcss) task
>> 3 processed stylesheets created.

Running "connect:livereload" (connect) task
Started connect web server on http://localhost:9000

Running "watch" task
Waiting...
```
		
###### Vous pouvez maintenant utiliser l'application [POM](http://localhost:9000) dans votre navigateur par défaut.
