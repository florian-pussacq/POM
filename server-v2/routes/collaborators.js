'use strict';
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authMiddleware, requireRole } = require('../middleware/auth');
const Collaborator = require('../models/Collaborator');
const Project = require('../models/Project');

// All routes require authentication
router.use(authMiddleware);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// ─── GET /api/collaborators ──────────────────────────────────────────────────
router.get('/', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const collaborators = await Collaborator.find();
    res.json(collaborators);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/collaborators/role/:role ──────────────────────────────────────
router.get('/role/:role', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const collaborators = await Collaborator.find({ role: req.params.role });
    res.json(collaborators);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/collaborators/:id/projects ────────────────────────────────────
router.get(
  '/:id/projects',
  [param('id').isMongoId().withMessage('Invalid id')],
  validate,
  async (req, res, next) => {
    try {
      const projects = await Project.find({ collaborateurs: req.params.id });
      res.json(projects);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/collaborators/:id ─────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid id')],
  validate,
  async (req, res, next) => {
    try {
      const collaborator = await Collaborator.findById(req.params.id);
      if (!collaborator) {
        return res.status(404).json({ success: false, message: 'Collaborateur introuvable' });
      }
      res.json(collaborator);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/collaborators ─────────────────────────────────────────────────
router.post(
  '/',
  requireRole('admin', 'manager'),
  [
    body('pseudo').trim().notEmpty().withMessage('Pseudo requis'),
    body('nom').trim().notEmpty().withMessage('Nom requis'),
    body('prenom').trim().notEmpty().withMessage('Prénom requis'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('mot_de_passe')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères'),
    body('role')
      .isIn(['admin', 'manager', 'collaborateur'])
      .withMessage('Rôle invalide'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await Collaborator.findOne({ pseudo: req.body.pseudo });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Ce pseudo est déjà utilisé.' });
      }

      const { mot_de_passe, ...rest } = req.body;
      const hashed = await bcrypt.hash(mot_de_passe, 12);
      const collaborator = await Collaborator.create({ ...rest, mot_de_passe: hashed });

      res.status(201).json({ success: true, message: 'Collaborateur créé avec succès.', data: collaborator });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/collaborators/:id ─────────────────────────────────────────────
router.put(
  '/:id',
  requireRole('admin', 'manager'),
  [param('id').isMongoId().withMessage('Invalid id')],
  validate,
  async (req, res, next) => {
    try {
      // Prevent changing password through this endpoint – use /auth/change-password
      const { mot_de_passe, ...update } = req.body;

      const collaborator = await Collaborator.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      });
      if (!collaborator) {
        return res.status(404).json({ success: false, message: 'Collaborateur introuvable' });
      }
      res.json(collaborator);
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/collaborators/:id ───────────────────────────────────────────
router.delete(
  '/:id',
  requireRole('admin'),
  [param('id').isMongoId().withMessage('Invalid id')],
  validate,
  async (req, res, next) => {
    try {
      const collaborator = await Collaborator.findByIdAndDelete(req.params.id);
      if (!collaborator) {
        return res.status(404).json({ success: false, message: 'Collaborateur introuvable' });
      }
      res.json({ success: true, message: 'Collaborateur supprimé.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
