'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Collaborator } from '@/types';
import { settings } from '@/lib/settings';
import { ArrowLeft, Save } from 'lucide-react';

export default function CollaboratorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [collab, setCollab] = useState<Collaborator | null>(null);
  const [managers, setManagers] = useState<Collaborator[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', role: '', fonction: '', cout_horaire: '0', manager: '',
  });

  const userRole = (session?.user as unknown as Record<string, unknown>)?.role as string;
  const canEdit = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    Promise.all([
      fetch(`/api/collaborators/${id}`).then(r => r.json()),
      fetch('/api/collaborators').then(r => r.json()).catch(() => []),
    ]).then(([collabData, allCollabs]) => {
      if (collabData._id) {
        setCollab(collabData);
        setForm({
          prenom: collabData.prenom || '',
          nom: collabData.nom || '',
          email: collabData.email || '',
          role: collabData.role || '',
          fonction: collabData.fonction || '',
          cout_horaire: String(collabData.cout_horaire || 0),
          manager: collabData.manager || '',
        });
      }
      const mgrs = Array.isArray(allCollabs) ? allCollabs.filter((c: Collaborator) => (c.role === 'admin' || c.role === 'manager') && c._id !== id) : [];
      setManagers(mgrs);
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/collaborators/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        role: form.role,
        fonction: form.fonction || undefined,
        cout_horaire: parseFloat(form.cout_horaire) || 0,
        manager: form.manager || null,
      }),
    });
    setSaving(false);
    router.push('/collaborators');
  };

  if (!collab) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/collaborators" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{collab.prenom} {collab.nom}</h1>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          collab.role === 'admin' ? 'bg-purple-100 text-purple-800' :
          collab.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>{collab.role}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Pseudo</label>
          <p className="text-gray-900">{collab.pseudo}</p>
        </div>

        <hr />

        {canEdit ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                <select value={form.fonction} onChange={(e) => setForm({ ...form, fonction: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">-- Sélectionner --</option>
                  {settings.fonctions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coût horaire (€/h)</label>
                <input type="number" min="0" step="0.01" value={form.cout_horaire}
                  onChange={(e) => setForm({ ...form, cout_horaire: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <select value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Aucun --</option>
                {managers.map(m => <option key={m._id} value={m._id}>{m.prenom} {m.nom}</option>)}
              </select>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
              <Save className="h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        ) : (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Email :</span> {collab.email}</p>
            <p><span className="font-medium">Fonction :</span> {collab.fonction || '-'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
