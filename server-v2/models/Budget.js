'use strict';
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    libelle: { type: String, required: true, trim: true },
    montant: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: 'date_creation', updatedAt: 'date_derniere_modif' },
  }
);

module.exports = mongoose.model('Budget', budgetSchema);
