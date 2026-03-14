'use strict';
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const Budget = require('../models/Budget');

router.use(authMiddleware);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  next();
};

router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    res.json(await Budget.find());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireRole('admin'), [param('id').isMongoId()], validate, async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ success: false, message: 'Ligne budgétaire introuvable' });
    res.json(budget);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  requireRole('admin'),
  [
    body('libelle').trim().notEmpty().withMessage('Libellé requis'),
    body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const budget = await Budget.create(req.body);
      res.status(201).json(budget);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', requireRole('admin'), [param('id').isMongoId()], validate, async (req, res, next) => {
  try {
    const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!budget) return res.status(404).json({ success: false, message: 'Ligne budgétaire introuvable' });
    res.json(budget);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('admin'), [param('id').isMongoId()], validate, async (req, res, next) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) return res.status(404).json({ success: false, message: 'Ligne budgétaire introuvable' });
    res.json({ success: true, message: 'Ligne budgétaire supprimée.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
