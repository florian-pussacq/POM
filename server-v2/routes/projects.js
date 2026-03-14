'use strict';
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const Project = require('../models/Project');

router.use(authMiddleware);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  next();
};

// ─── GET /api/projects ───────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('chef_projet', 'nom prenom pseudo')
      .populate('collaborateurs', 'nom prenom pseudo');
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/projects/:id ───────────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('chef_projet', 'nom prenom pseudo')
        .populate('collaborateurs', 'nom prenom pseudo');
      if (!project) return res.status(404).json({ success: false, message: 'Projet introuvable' });
      res.json(project);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/projects ──────────────────────────────────────────────────────
router.post(
  '/',
  requireRole('admin', 'manager'),
  [
    body('nom').trim().notEmpty().withMessage('Nom requis'),
    body('statut').optional().isIn(['Initial', 'En cours', 'Terminé', 'Annulé', 'Supprimé']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.create(req.body);
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/projects/:id ───────────────────────────────────────────────────
router.put(
  '/:id',
  requireRole('admin', 'manager'),
  [param('id').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!project) return res.status(404).json({ success: false, message: 'Projet introuvable' });
      res.json(project);
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/projects/:id ────────────────────────────────────────────────
router.delete(
  '/:id',
  requireRole('admin', 'manager'),
  [param('id').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Projet introuvable' });
      res.json({ success: true, message: 'Projet supprimé.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
