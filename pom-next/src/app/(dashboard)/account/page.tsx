'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Collaborator } from '@/types';
import { Save, User } from 'lucide-react';

export default function AccountPage() {
  const { data: session } = useSession();
  const [collab, setCollab] = useState<Collaborator | null>(null);
  const [managerName, setManagerName] = useState('');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/collaborators/${session.user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data._id) {
          setCollab(data);
          if (data.manager) {
            fetch(`/api/collaborators/${data.manager}`)
              .then(r => r.json())
              .then(m => setManagerName(m._id ? `${m.prenom} ${m.nom}` : '-'))
              .catch(() => setManagerName('-'));
          }
        }
      });
  }, [session?.user?.id]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setPwdMsg('');
    setPwdError(false);

    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
    });
    const data = await res.json();
    setPwdMsg(data.message);
    setPwdError(!res.ok);
    setSaving(false);
    if (res.ok) {
      setCurrentPwd('');
      setNewPwd('');
    }
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
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-green-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{collab.prenom} {collab.nom}</h2>
            <p className="text-gray-500">@{collab.pseudo}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Email</span>
            <p className="text-gray-900">{collab.email}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Rôle</span>
            <p className="text-gray-900 capitalize">{collab.role}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Fonction</span>
            <p className="text-gray-900">{collab.fonction || '-'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Coût horaire</span>
            <p className="text-gray-900">{collab.cout_horaire} €/h</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Manager</span>
            <p className="text-gray-900">{managerName || '-'}</p>
          </div>
        </div>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>

        {pwdMsg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${pwdError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {pwdMsg}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe (min 8 caractères)</label>
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" />
            {saving ? 'Modification...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
