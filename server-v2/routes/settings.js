'use strict';
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const settings = require('../settings.json');

router.use(authMiddleware);

router.get('/', (req, res) => res.json(settings));
router.get('/roles', (req, res) => res.json(settings.roles));
router.get('/fonctions', (req, res) => res.json(settings.fonctions));
router.get('/statuts', (req, res) => res.json(settings.statuts));
router.get('/categories', (req, res) => res.json(settings.categories));

module.exports = router;
