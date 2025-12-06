const express = require('express');
const { Course } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// GET /courses?year=1
router.get('/', async (req, res) => {
  try {
    const { year } = req.query;
    const where = {};
    if (year) where.year = year;

    const courses = await Course.findAll({ where });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea materiilor.' });
  }
});

module.exports = router;


