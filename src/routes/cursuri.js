const express = require('express');
const { Curs, Specializare } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

//ruta pentru obtinerea cursurilor filtrate dupa an si semestru
router.get('/', async (req, res) => {
  try {
    const { an, semestru } = req.query;

    //1. aflam specializarea studentului logat
    const { Student } = require('../models');
    const student = await Student.findByPk(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Studentul nu a fost gasit.' });
    }

    const where = {
      specializareId: student.specializareId
    };

    if (an) where.an = an;
    if (semestru) where.semestru = semestru;

    const cursuri = await Curs.findAll({
      where,
      include: [{ model: Specializare, as: 'specializare' }]
    });
    res.json(cursuri);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea materiilor.' });
  }
});

//ruta pentru adaugarea unei materii noi
router.post('/', async (req, res) => {
  try {
    const { nume, an, semestru } = req.body;
    const { Student } = require('../models');

    //1. identificam studentul pentru a afla specializarea
    const student = await Student.findByPk(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student necunoscut.' });
    }

    //2. cream cursul
    const cursNou = await Curs.create({
      nume,
      an,
      semestru,
      specializareId: student.specializareId
    });

    res.status(201).json(cursNou);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la crearea materiei.' });
  }
});

module.exports = router;
