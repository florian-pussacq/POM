'use strict';
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    chef_projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaborateur' },
    date_debut: Date,
    date_fin_theorique: Date,
    date_fin_reelle: Date,
    statut: {
      type: String,
      enum: ['Initial', 'En cours', 'Terminé', 'Annulé', 'Supprimé'],
      default: 'Initial',
    },
    collaborateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborateur' }],
    ligne_budgetaire: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' },
      montant_restant: Number,
    },
    description: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: 'date_creation', updatedAt: 'date_derniere_modif' },
  }
);

module.exports = mongoose.model('Project', projectSchema);
