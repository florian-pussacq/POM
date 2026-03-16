import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { db } from '@/lib/data/store';
import { authConfig } from '@/lib/auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        pseudo: { label: 'Pseudo', type: 'text' },
        mot_de_passe: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const pseudo = credentials?.pseudo as string;
        const password = credentials?.mot_de_passe as string;

        if (!pseudo || !password) return null;

        const user = db.getCollaboratorByPseudo(pseudo);
        if (!user || !user.mot_de_passe) return null;

        const isValid = await bcryptjs.compare(password, user.mot_de_passe);
        if (!isValid) return null;

        return {
          id: user._id,
          name: `${user.prenom} ${user.nom}`,
          email: user.email,
          role: user.role,
          pseudo: user.pseudo,
          prenom: user.prenom,
          nom: user.nom,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as Record<string, unknown>).role;
        token.pseudo = (user as unknown as Record<string, unknown>).pseudo;
        token.prenom = (user as unknown as Record<string, unknown>).prenom;
        token.nom = (user as unknown as Record<string, unknown>).nom;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).pseudo = token.pseudo;
        (session.user as unknown as Record<string, unknown>).prenom = token.prenom;
        (session.user as unknown as Record<string, unknown>).nom = token.nom;
      }
      return session;
    },
  },
});
