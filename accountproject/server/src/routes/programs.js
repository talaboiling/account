const express = require('express');
const repo = require('../repo');
const { requireAuth } = require('../auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  res.json({ programs: repo.getAllPrograms() });
});

module.exports = router;
