const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, specialization } = req.body;

    if (!email || !password || !firstName || !lastName || !specialization) {
      return res.status(400).json({ message: 'Toate campurile sunt obligatorii.' });
    }

    if (!email.endsWith('@stud.ase.ro')) {
      return res
        .status(400)
        .json({ message: 'Emailul trebuie sa fie din domeniul institutional (@stud.ase.ro).' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Exista deja un cont cu acest email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      specialization,
    });

    return res.status(201).json({
      message: 'Cont creat cu succes. Te poti autentifica acum.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la inregistrare.' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email si parola sunt obligatorii.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credentiale invalide.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Credentiale invalide.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        specialization: user.specialization,
        collaborationCode: user.collaborationCode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la autentificare.' });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'specialization', 'collaborationCode'],
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la obtinerea profilului.' });
  }
});

// POST /auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Parola veche si noua sunt obligatorii.' });
    }

    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: 'Parola veche este incorecta.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Parola a fost schimbata cu succes.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la schimbarea parolei.' });
  }
});

module.exports = router;


