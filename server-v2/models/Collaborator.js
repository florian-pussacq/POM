'use strict';
const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    pseudo: { type: String, required: true, unique: true, trim: true, lowercase: true },
    mot_de_passe: { type: String, required: true, select: false },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaborateur', default: null },
    fonction: { type: String, trim: true },
    cout_horaire: { type: Number, min: 0, default: 0 },
    role: {
      type: String,
      enum: ['admin', 'collaborateur', 'manager'],
      default: 'collaborateur',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
  },
  {
    timestamps: { createdAt: 'date_creation', updatedAt: 'date_derniere_modif' },
  }
);

// Never return the password by default
collaboratorSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.mot_de_passe;
    return ret;
  },
});

module.exports = mongoose.model('Collaborateur', collaboratorSchema);
