'use strict';
const express = require('express');
const router = express.Router();
const pkg = require('../package.json');

router.get('/', (req, res) => {
  res.json({ api: pkg.version });
});

module.exports = router;
