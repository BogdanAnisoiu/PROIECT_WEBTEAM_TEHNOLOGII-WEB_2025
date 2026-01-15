const express = require('express');
const { NotitaPartajata, Notita, Student, CererePrietenie } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { notitaId, studentIds } = req.body;
    if (!notitaId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'notitaId si studentIds sunt obligatorii.' });
    }

    const notita = await Notita.findByPk(notitaId);
    if (!notita || notita.studentId !== req.user.id) {
      return res.status(404).json({ message: 'Notita nu exista sau nu este a ta.' });
    }

    const results = [];

    for (const targetId of studentIds) {
      // Check permission in CererePrietenie (accepted)
      // We look for a request between me and target (either direction) that is accepted
      const cerere = await CererePrietenie.findOne({
        where: {
          [Op.or]: [
            { expeditorId: req.user.id, destinatarId: targetId },
            { expeditorId: targetId, destinatarId: req.user.id }
          ],
          status: 'accepted'
        }
      });

      // Permission Logic (as requested):
      // "foloseste te de poateEdita din cererePrietenie... daca este true.. pot trimite sau primi notite pe care le modific"
      // Interpretation: poateEdita is a shared "trust level" established at friendship. 
      // If true, we share References. If false, we share Copies.
      const poateEdita = cerere ? cerere.poateEdita : false;

      if (poateEdita) {
        // Reference Mode (Original)
        const share = await NotitaPartajata.create({
          notitaId,
          studentId: targetId,
          poateEdita: true, // Correct field name matching model
        });
        results.push({ type: 'reference', id: share.id, targetId });
      } else {
        // Copy Mode (Snapshot)
        // Duplicate the note for targetId
        const duplicatedNote = await Notita.create({
          titlu: notita.titlu,
          continut: notita.continut,
          tip: notita.tip,
          cursId: notita.cursId,
          studentId: targetId, // Target owns the copy
          etichete: notita.etichete,
          cuvinteCheie: notita.cuvinteCheie
        });
        results.push({ type: 'copy', id: duplicatedNote.id, targetId });
      }
    }

    res.status(201).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la partajarea notitei.' });
  }
});

router.get('/primite', async (req, res) => {
  try {
    const shares = await NotitaPartajata.findAll({
      where: { studentId: req.user.id },
      include: [
        {
          model: Notita,
          include: [{ model: Student, as: 'autor', attributes: ['id', 'prenume', 'nume'] }],
        },
      ],
    });
    res.json(shares);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea notitelor primite.' });
  }
});

router.get('/trimise', async (req, res) => {
  try {
    const notite = await Notita.findAll({ where: { studentId: req.user.id } });
    const notiteIds = notite.map((n) => n.id);
    const shares = await NotitaPartajata.findAll({
      where: { notitaId: notiteIds },
      include: [
        { model: Student, attributes: ['id', 'prenume', 'nume', 'email'] },
        { model: Notita }, //include notita pentru context
      ],
    });
    res.json(shares);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea notitelor distribuite.' });
  }
});

module.exports = router;
