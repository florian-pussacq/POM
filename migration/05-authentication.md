# 5. Authentification

## NextAuth.js v5

L'authentification utilise **NextAuth.js v5** (beta) avec le provider `Credentials`.

### Configuration (`src/lib/auth.ts`)

- **Provider** : `Credentials` (pseudo + mot de passe)
- **Session strategy** : JWT (pas de session BDD)
- **Durée du token** : 8 heures
- **Hachage** : bcryptjs avec 12 salt rounds

### Flux de connexion

1. L'utilisateur saisit pseudo + mot de passe sur `/login`
2. `signIn('credentials', { pseudo, mot_de_passe })` appelle NextAuth
3. NextAuth appelle `authorize()` :
   - Recherche le collaborateur par pseudo dans le store
   - Compare le mot de passe avec `bcryptjs.compare()`
   - Retourne l'utilisateur si valide, `null` sinon
4. NextAuth crée un JWT contenant : `id`, `role`, `pseudo`, `prenom`, `nom`
5. Le JWT est stocké dans un cookie httpOnly
6. Côté client, `useSession()` donne accès aux données utilisateur

### Callbacks JWT/Session

Les callbacks enrichissent le token et la session avec les champs métier :

```typescript
// JWT callback : user → token
token.id = user.id;
token.role = user.role;
token.pseudo = user.pseudo;

// Session callback : token → session.user
session.user.id = token.id;
session.user.role = token.role;
```

### Extension des types

Les types NextAuth sont étendus dans `src/types/next-auth.d.ts` pour inclure `role`, `pseudo`, `prenom`, `nom` sur `User`, `Session` et `JWT`.

### Protection des routes

- **Côté client** : `useSession()` dans les composants. Le sidebar filtre les liens selon le rôle.
- **Côté API** : Chaque route appelle `auth()` pour vérifier la session et le rôle.

### Changement de mot de passe

`PUT /api/auth/change-password` :
1. Vérifie la session
2. Vérifie l'ancien mot de passe
3. Hache le nouveau avec bcryptjs
4. Met à jour dans le store

### Réinitialisation de mot de passe

`POST /api/auth/reset-password` :
1. Reçoit le pseudo
2. Si le pseudo existe, génère un nouveau mot de passe aléatoire
3. En production, enverrait un email (Mailgun)
4. Retourne toujours le même message (anti-énumération)
