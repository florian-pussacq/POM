'use strict';
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    libelle: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String, trim: true },
    categorie: { type: String, trim: true },
    date_debut: Date,
    date_fin_theorique: Date,
    date_fin_reelle: Date,
    statut: {
      type: String,
      enum: ['Initial', 'En cours', 'Terminé', 'Annulé'],
      default: 'Initial',
    },
    projet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    collaborateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborateur' }],
  },
  {
    timestamps: { createdAt: 'date_creation', updatedAt: 'date_derniere_modif' },
  }
);

module.exports = mongoose.model('Task', taskSchema);
