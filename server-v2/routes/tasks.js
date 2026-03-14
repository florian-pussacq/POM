'use strict';
const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :projectId
const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { authMiddleware, requireRole } = require('../middleware/auth');
const Project = require('../models/Project');

router.use(authMiddleware);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  next();
};

// ─── GET /api/projects/:projectId/tasks ─────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Projet introuvable' });
    res.json(project.taches || []);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/projects/:projectId/tasks ────────────────────────────────────
router.post(
  '/',
  requireRole('admin', 'manager'),
  [
    body('libelle').trim().notEmpty().withMessage('Libellé requis'),
    body('categorie')
      .isIn(['Etude de projet', 'Spécification', 'Développement', 'Recette', 'Mise en production'])
      .withMessage('Catégorie invalide'),
    body('date_debut').optional().isISO8601().withMessage('Date début invalide'),
    body('date_fin_theorique').optional().isISO8601().withMessage('Date fin théorique invalide'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Projet introuvable' });

      // Auto-generate task code
      let maxCode = 0;
      for (const t of project.taches) {
        if (t.code) {
          const num = parseInt(t.code.replace(/.*T/, ''), 10);
          if (!isNaN(num) && num > maxCode) maxCode = num;
        }
      }
      const codeNum = String(maxCode + 1).padStart(3, '0');
      const taskCode = `${project.code}T${codeNum}`;

      const task = {
        _id: new mongoose.Types.ObjectId(),
        libelle: req.body.libelle,
        code: taskCode,
        categorie: req.body.categorie,
        description: req.body.description || '',
        date_debut: req.body.date_debut || new Date(),
        date_fin_theorique: req.body.date_fin_theorique || new Date(),
        statut: 'Initial',
        collaborateurs: req.body.collaborateurs || [],
        projet_id: project._id,
      };

      project.taches.push(task);
      await project.save();

      res.status(201).json(project.taches[project.taches.length - 1]);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/projects/:projectId/tasks/:taskId ──────────────────────────────
router.get(
  '/:taskId',
  [param('taskId').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Projet introuvable' });

      const task = project.taches.id(req.params.taskId);
      if (!task) return res.status(404).json({ success: false, message: 'Tâche introuvable' });

      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/projects/:projectId/tasks/:taskId ──────────────────────────────
router.put(
  '/:taskId',
  requireRole('admin', 'manager'),
  [param('taskId').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Projet introuvable' });

      const task = project.taches.id(req.params.taskId);
      if (!task) return res.status(404).json({ success: false, message: 'Tâche introuvable' });

      const allowed = ['libelle', 'description', 'categorie', 'statut', 'date_debut',
                       'date_fin_theorique', 'date_fin_reelle', 'collaborateurs'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) task[key] = req.body[key];
      }

      await project.save();
      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/projects/:projectId/tasks/:taskId ───────────────────────────
router.delete(
  '/:taskId',
  requireRole('admin', 'manager'),
  [param('taskId').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Projet introuvable' });

      const task = project.taches.id(req.params.taskId);
      if (!task) return res.status(404).json({ success: false, message: 'Tâche introuvable' });

      task.deleteOne();
      await project.save();
      res.json({ success: true, message: 'Tâche supprimée.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
