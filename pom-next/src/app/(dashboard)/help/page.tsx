'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'Comment créer un projet ?',
    answer: 'Rendez-vous dans la section "Projets" via le menu latéral, puis cliquez sur "Nouveau projet". Remplissez le formulaire avec le nom du projet, les dates de début et fin, la ligne budgétaire et les collaborateurs. Le code du projet est généré automatiquement.',
  },
  {
    question: 'Comment gérer les collaborateurs ?',
    answer: 'Les administrateurs et managers peuvent gérer les collaborateurs via la section "Collaborateurs". Les admins peuvent créer tous types de rôles, tandis que les managers ne peuvent créer que des collaborateurs. Chaque collaborateur a un pseudo unique, un email, un rôle et optionnellement une fonction et un coût horaire.',
  },
  {
    question: 'Comment changer mon mot de passe ?',
    answer: 'Cliquez sur votre nom dans le menu latéral pour accéder à votre profil. En bas de la page, vous trouverez un formulaire pour changer votre mot de passe. Vous devez saisir votre mot de passe actuel et le nouveau mot de passe (minimum 8 caractères).',
  },
  {
    question: 'Comment fonctionnent les lignes budgétaires ?',
    answer: 'Les lignes budgétaires sont créées par les administrateurs dans la section "Budgets". Chaque projet peut être associé à une ligne budgétaire. La consommation est calculée automatiquement en fonction du coût des tâches (coût horaire × 7h × jours ouvrés × nombre de collaborateurs).',
  },
  {
    question: 'Comment archiver ou clôturer un projet ?',
    answer: 'Pour archiver ou clôturer un projet, toutes les tâches doivent être en statut "Terminé(e)" ou "Annulé(e)". L\'archivage change le statut en "Archivé". La clôture change le statut en "Terminé(e)" et enregistre la date de fin réelle.',
  },
];

export default function HelpPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Aide</h1>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              {openIdx === idx ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </button>
            {openIdx === idx && (
              <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
