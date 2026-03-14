'use strict';
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    libelle: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String, trim: true },
    categorie: {
      type: String,
      enum: ['Etude de projet', 'Spécification', 'Développement', 'Recette', 'Mise en production'],
    },
    date_debut: Date,
    date_fin_theorique: Date,
    date_fin_reelle: Date,
    statut: {
      type: String,
      enum: ['Initial', 'En cours', 'Terminé(e)', 'Annulé(e)'],
      default: 'Initial',
    },
    projet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    collaborateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborateur' }],
  },
  {
    timestamps: { createdAt: 'date_creation', updatedAt: 'date_derniere_modif' },
  }
);

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
      enum: ['Initial', 'En cours', 'Terminé(e)', 'Annulé(e)', 'Archivé'],
      default: 'Initial',
    },
    collaborateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborateur' }],
    ligne_budgetaire: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' },
      montant_restant: Number,
    },
    description: { type: String, trim: true },
    taches: [taskSchema],
  },
  {
    timestamps: { createdAt: 'date_creation', updatedAt: 'date_derniere_modif' },
  }
);

module.exports = mongoose.model('Project', projectSchema);
