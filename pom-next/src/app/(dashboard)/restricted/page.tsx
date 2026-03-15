import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function RestrictedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <ShieldAlert className="h-16 w-16 text-red-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
      <p className="text-gray-500 mb-6">
        Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <Link
        href="/dashboard"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
