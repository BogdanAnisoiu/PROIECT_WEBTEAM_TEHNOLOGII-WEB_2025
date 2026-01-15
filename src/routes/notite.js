const express = require('express');
const { Op } = require('sequelize');
const { Notita, Curs, Student, NotitaPartajata, Specializare, NotitaGrup, MembruGrup } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

//ruta pentru obtinerea listei de notite 
router.get('/', async (req, res) => {
  try {
    const { cursId, tip, q } = req.query;
    const where = { studentId: req.user.id };
    if (cursId) where.cursId = cursId;
    if (tip) where.tip = tip;

    if (q) {
      where[Op.or] = [
        { titlu: { [Op.like]: `%${q}%` } },
        { continut: { [Op.like]: `%${q}%` } },
        { cuvinteCheie: { [Op.like]: `%${q}%` } },
      ];
    }

    const notite = await Notita.findAll({
      where,
      include: [{ model: Curs, as: 'curs' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(notite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea notitelor.' });
  }
});

//ruta pentru obtinerea notitelor partajate cu utilizatorul curent
router.get('/partajate', async (req, res) => {
  try {
    const studentId = req.user.id;
    const shares = await NotitaPartajata.findAll({
      where: { studentId },
      include: [
        {
          model: Notita,
          include: [
            { model: Curs, as: 'curs' },
            { model: Student, as: 'autor', attributes: ['id', 'prenume', 'nume'] }, //nume, prenume
          ],
        },
      ],
    });
    res.json(shares);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea notitelor partajate.' });
  }
});

//ruta pentru obtinerea unei singure notite dupa id
router.get('/:id', async (req, res) => {
  try {
    const notita = await Notita.findByPk(req.params.id);
    if (!notita)
      return res.status(404).json({ message: 'Nu a fost gasita notita.' });
    res.json(notita);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la afisarea notitei.' });
  }
});

//ruta pentru crearea unei notite noi
router.post('/', async (req, res) => {
  try {
    //frontend-ul ar trebui sa trimita: cursId, tip, titlu, continut, etc
    const { cursId, tip, titlu, continut, cuvinteCheie } = req.body;

    if (!cursId || !tip || !titlu || !continut) {
      return res.status(400).json({ message: 'Campuri obligatorii lipsa.' });
    }

    const notita = await Notita.create({
      studentId: req.user.id,
      cursId,
      tip,
      titlu,
      continut,
      cuvinteCheie: cuvinteCheie || [],
    });

    res.status(201).json(notita);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la crearea notitei.' });
  }
});

//ruta pentru actualizarea unei notite existente
router.put('/:id', async (req, res) => {
  try {
    const notita = await Notita.findByPk(req.params.id);
    if (!notita) {
      return res.status(404).json({ message: 'Notita nu exista.' });
    }

    // Check ownership
    const isOwner = notita.studentId === req.user.id;
    let canEdit = isOwner;

    console.log(`[DEBUG] PUT /notite/${req.params.id} - User: ${req.user.id}, Owner: ${notita.studentId}, isOwner: ${isOwner}`);

    // If not owner, check sharing permissions
    if (!isOwner) {
      const share = await NotitaPartajata.findOne({
        where: {
          notitaId: notita.id,
          studentId: req.user.id
        }
      });
      console.log(`[DEBUG] Share record found:`, share ? share.toJSON() : 'null');

      if (share && share.poateEdita) {
        canEdit = true;
      }
    }

    // If still no edit rights, check if it's a group note and user is a member
    if (!canEdit) {
      // 1. Find all groups this note belongs to
      const groupLinks = await NotitaGrup.findAll({ where: { notitaId: notita.id } });
      const groupIds = groupLinks.map(gl => gl.grupId);

      if (groupIds.length > 0) {
        // 2. Check if user is a member of any of these groups
        const membership = await MembruGrup.findOne({
          where: {
            grupId: { [Op.in]: groupIds },
            studentId: req.user.id
          }
        });

        if (membership) {
          canEdit = true; // Allow edit if member of the group
          console.log(`[DEBUG] Allowed edit via Group membership in group(s): ${groupIds.join(', ')}`);
        }
      }
    }

    if (!canEdit) {
      console.log(`[DEBUG] Access denied for user ${req.user.id} on note ${req.params.id}`);
      return res.status(403).json({ message: 'Nu ai dreptul sa editezi aceasta notita.' });
    }

    const { titlu, continut, cuvinteCheie } = req.body;
    if (titlu !== undefined) notita.titlu = titlu;
    if (continut !== undefined) notita.continut = continut;
    if (cuvinteCheie !== undefined) notita.cuvinteCheie = cuvinteCheie;

    await notita.save();
    res.json(notita);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la actualizarea notitei.' });
  }
});

//ruta pentru stergerea unei notite
router.delete('/:id', async (req, res) => {
  try {
    const notita = await Notita.findByPk(req.params.id);
    if (!notita || notita.studentId !== req.user.id) {
      return res.status(404).json({ message: 'Notita nu exista sau nu este a ta.' });
    }
    await notita.destroy();
    res.json({ message: 'Notita stearsa.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la stergerea notitei.' });
  }
});

module.exports = router;
