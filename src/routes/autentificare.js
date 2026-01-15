const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Student, Specializare } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /autentificare/inregistrare
router.post('/inregistrare', async (req, res) => {
  try {
    //frontend-ul trebuie sa trimita: email, password, prenume, nume, specializare (numele specializarii)
    const { email, password, prenume, nume, specializare } = req.body;

    if (!email || !password || !prenume || !nume || !specializare) {
      return res.status(400).json({ message: 'Toate campurile sunt obligatorii.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Parola trebuie sa aiba minim 8 caractere.' });
    }

    if (!email.endsWith('@stud.ase.ro')) {
      return res
        .status(400)
        .json({ message: 'Emailul trebuie sa fie din domeniul institutional (@stud.ase.ro).' });
    }

    const existing = await Student.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Exista deja un cont cu acest email.' });
    }

    const spec = await Specializare.findOne({ where: { nume: specializare } });
    if (!spec) {
      return res.status(400).json({ message: 'Specializarea aleasa nu exista.' });
    }

    const parolaHash = await bcrypt.hash(password, 10);

    const student = await Student.create({
      email,
      parolaHash,
      prenume,
      nume,
      specializareId: spec.id,
    });

    return res.status(201).json({
      message: 'Cont creat cu succes. Te poti autentifica acum.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la inregistrare.' });
  }
});

// POST /autentificare/conectare
router.post('/conectare', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email si parola sunt obligatorii.' });
    }

    const student = await Student.findOne({
      where: { email },
      include: [{ model: Specializare, as: 'specializare' }]
    });

    if (!student) {
      return res.status(401).json({ message: 'Credentiale invalide.' });
    }

    const valid = await bcrypt.compare(password, student.parolaHash); //era passwordhash
    if (!valid) {
      return res.status(401).json({ message: 'Credentiale invalide.' });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { //pastram cheia 'user' pentru compatibilitate frontend
        id: student.id,
        email: student.email,
        prenume: student.prenume,
        nume: student.nume,
        specializare: student.specializare ? student.specializare.nume : '',
        codColaborare: student.codColaborare,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la autentificare.' });
  }
});

// GET /autentificare/eu
router.get('/eu', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(req.user.id, {
      attributes: ['id', 'email', 'prenume', 'nume', 'specializareId', 'codColaborare'],
      include: [{ model: Specializare, as: 'specializare' }]
    });
    //mapare raspuns catre obiect curat
    res.json({
      id: student.id,
      email: student.email,
      prenume: student.prenume,
      nume: student.nume,
      codColaborare: student.codColaborare,
      specializare: student.specializare ? student.specializare.nume : ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la obtinerea profilului.' });
  }
});

// POST /autentificare/schimba-parola
router.post('/schimba-parola', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Parola veche si noua sunt obligatorii.' });
    }

    const student = await Student.findByPk(req.user.id);
    const valid = await bcrypt.compare(oldPassword, student.parolaHash);
    if (!valid) {
      return res.status(400).json({ message: 'Parola veche este incorecta.' });
    }

    student.parolaHash = await bcrypt.hash(newPassword, 10);
    await student.save();

    res.json({ message: 'Parola a fost schimbata cu succes.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la schimbarea parolei.' });
  }
});

module.exports = router;
