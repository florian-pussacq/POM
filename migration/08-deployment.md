# 8. Déploiement

## Déploiement local

### Développement

```bash
cd pom-next

# Créer .env.local (voir .env.example)
cp .env.example .env.local
# Éditer .env.local avec un AUTH_SECRET sécurisé

npm install
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

### Build de production

```bash
npm run build   # Génère le build optimisé
npm run start   # Démarre le serveur de production
```

## Déploiement Vercel

### Étapes

1. **Connecter le repo** : Lier le repository GitHub à Vercel
2. **Configurer le projet** :
   - Root Directory : `pom-next`
   - Framework Preset : Next.js (auto-détecté)
   - Build Command : `npm run build`
   - Output Directory : `.next`
3. **Variables d'environnement** :
   - `AUTH_SECRET` : Générer avec `openssl rand -base64 64`
   - `NEXTAUTH_URL` : URL de production (ex: `https://pom.vercel.app`)
4. **Déployer** : Push sur la branche principale

### Configuration Vercel (`vercel.json`, optionnel)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

## Déploiement Docker (alternatif)

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Pour utiliser le mode standalone, ajouter dans `next.config.ts` :

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
};
```

### docker-compose.yml

```yaml
services:
  app:
    build: ./pom-next
    ports:
      - "3000:3000"
    environment:
      - AUTH_SECRET=votre-secret
      - NEXTAUTH_URL=http://localhost:3000
```

## Notes importantes

- **Pas de BDD externe** : L'application fonctionne sans base de données (données en mémoire)
- **Serverless** : Compatible Vercel serverless (une instance = un store frais)
- **Cold start** : Les données initiales sont rechargées à chaque cold start
- **Production** : Pour une vraie persistance, migrer vers PostgreSQL (voir étapes futures)
