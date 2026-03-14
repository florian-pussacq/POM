'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const Collaborator = require('../models/Collaborator');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('pseudo').trim().notEmpty().withMessage('Pseudo requis'),
    body('mot_de_passe').notEmpty().withMessage('Mot de passe requis'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const { pseudo, mot_de_passe } = req.body;

      const collaborator = await Collaborator.findOne({ pseudo }).select('+mot_de_passe');
      if (!collaborator) {
        return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      }

      const isMatch = await bcrypt.compare(mot_de_passe, collaborator.mot_de_passe);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      }

      const token = jwt.sign(
        { id: collaborator._id, role: collaborator.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Return collaborator without password (toJSON transform removes it)
      res.json({
        success: true,
        message: 'Connexion réussie',
        token,
        collaborator,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/reset-password ──────────────────────────────────────────
router.post(
  '/reset-password',
  [body('pseudo').trim().notEmpty().withMessage('Pseudo requis')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const collaborator = await Collaborator.findOne({ pseudo: req.body.pseudo });
      if (!collaborator) {
        // Do not reveal whether the user exists
        return res.json({
          success: true,
          message: 'Si ce pseudo existe, un email de réinitialisation a été envoyé.',
        });
      }

      // Generate a secure temporary password
      const newPassword = crypto.randomBytes(8).toString('hex');
      const hashed = await bcrypt.hash(newPassword, 12);
      collaborator.mot_de_passe = hashed;
      await collaborator.save();

      // Send email if Mailgun is configured
      if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
        try {
          const mailgun = require('mailgun-js')({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN,
          });
          await mailgun.messages().send({
            from: process.env.MAILGUN_FROM || 'POM <noreply@example.com>',
            to: collaborator.email,
            subject: 'Réinitialisation de votre mot de passe | POM',
            text: `Bonjour ${collaborator.pseudo}, votre nouveau mot de passe est : ${newPassword}\nVeuillez le changer après connexion.`,
          });
        } catch (mailErr) {
          console.error('Email send error:', mailErr.message);
          // Do not expose email errors to the client
        }
      }

      res.json({ success: true, message: 'Si ce pseudo existe, un email de réinitialisation a été envoyé.' });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/auth/change-password ──────────────────────────────────────────
router.put(
  '/change-password',
  authMiddleware,
  [
    body('current_password').notEmpty().withMessage('Mot de passe actuel requis'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const collaborator = await Collaborator.findById(req.user.id).select('+mot_de_passe');
      if (!collaborator) {
        return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      }

      const isMatch = await bcrypt.compare(req.body.current_password, collaborator.mot_de_passe);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
      }

      collaborator.mot_de_passe = await bcrypt.hash(req.body.new_password, 12);
      await collaborator.save();

      res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const collaborator = await Collaborator.findById(req.user.id);
    if (!collaborator) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }
    res.json({ success: true, collaborator });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
