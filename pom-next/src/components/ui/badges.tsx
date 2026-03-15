import { cn } from '@/lib/utils/cn';

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    'Initial': 'bg-blue-100 text-blue-800',
    'En cours': 'bg-orange-100 text-orange-800',
    'Terminé(e)': 'bg-green-100 text-green-800',
    'Annulé(e)': 'bg-red-100 text-red-800',
    'Archivé': 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', colorMap[status] || 'bg-gray-100 text-gray-800')}>
      {status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    'Etude de projet': 'bg-red-100 text-red-800',
    'Spécification': 'bg-orange-100 text-orange-800',
    'Développement': 'bg-blue-100 text-blue-800',
    'Recette': 'bg-yellow-100 text-yellow-800',
    'Mise en production': 'bg-green-100 text-green-800',
  };

  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', colorMap[category] || 'bg-gray-100 text-gray-800')}>
      {category}
    </span>
  );
}
