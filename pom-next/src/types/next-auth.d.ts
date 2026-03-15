import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
    pseudo?: string;
    prenom?: string;
    nom?: string;
  }

  interface Session {
    user: User & {
      id: string;
      role?: string;
      pseudo?: string;
      prenom?: string;
      nom?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    pseudo?: string;
    prenom?: string;
    nom?: string;
  }
}
