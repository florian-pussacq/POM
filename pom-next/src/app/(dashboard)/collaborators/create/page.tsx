'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Collaborator } from '@/types';
import { settings } from '@/lib/settings';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CollaboratorCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [managers, setManagers] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    prenom: '', nom: '', pseudo: '', email: '', mot_de_passe: '',
    role: 'collaborateur', fonction: '', cout_horaire: '0', manager: '',
  });

  const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string;

  useEffect(() => {
    fetch('/api/collaborators').then(r => r.json()).then(data => {
      setManagers(Array.isArray(data) ? data.filter((c: Collaborator) => c.role === 'admin' || c.role === 'manager') : []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/collaborators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cout_horaire: parseFloat(form.cout_horaire) || 0,
        manager: form.manager || undefined,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/collaborators');
    } else {
      setError(data.message || 'Erreur lors de la création');
      setLoading(false);
    }
  };

  const availableRoles = userRole === 'admin'
    ? ['manager', 'collaborateur']
    : ['collaborateur'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/collaborators" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau collaborateur</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pseudo *</label>
            <input type="text" value={form.pseudo} onChange={(e) => setForm({ ...form, pseudo: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe * (min 8 caractères)</label>
          <input type="password" value={form.mot_de_passe} onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })} required minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
            <select value={form.fonction} onChange={(e) => setForm({ ...form, fonction: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">-- Sélectionner --</option>
              {settings.fonctions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coût horaire (€/h)</label>
            <input type="number" min="0" step="0.01" value={form.cout_horaire}
              onChange={(e) => setForm({ ...form, cout_horaire: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <select value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">-- Aucun --</option>
              {managers.map(m => <option key={m._id} value={m._id}>{m.prenom} {m.nom}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
          <Save className="h-4 w-4" />
          {loading ? 'Création...' : 'Créer le collaborateur'}
        </button>
      </form>
    </div>
  );
}
