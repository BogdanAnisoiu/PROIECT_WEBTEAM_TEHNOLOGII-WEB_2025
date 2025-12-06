const express = require('express');
const { Op } = require('sequelize');
const { Note, Course, User, Share } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// GET /notes - notitele mele (si optional filtrare)
router.get('/', async (req, res) => {
  try {
    const { courseId, type, q } = req.query;
    const where = { userId: req.user.id };
    if (courseId) where.courseId = courseId;
    if (type) where.type = type;

    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { contentMarkdown: { [Op.like]: `%${q}%` } },
        { tags: { [Op.like]: `%${q}%` } },
        { keywords: { [Op.like]: `%${q}%` } },
      ];
    }

    const notes = await Note.findAll({
      where,
      include: [{ model: Course, as: 'course' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea notitelor.' });
  }
});

// GET /notes/shared - notite partajate cu mine
router.get('/shared', async (req, res) => {
  try {
    const userId = req.user.id;
    const shares = await Share.findAll({
      where: { userId },
      include: [
        {
          model: Note,
          include: [
            { model: Course, as: 'course' },
            { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
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

// POST /notes
router.post('/', async (req, res) => {
  try {
    const { courseId, type, title, contentMarkdown, date, tags, keywords } = req.body;

    if (!courseId || !type || !title || !contentMarkdown) {
      return res.status(400).json({ message: 'Campuri obligatorii lipsa.' });
    }

    const note = await Note.create({
      userId: req.user.id,
      courseId,
      type,
      title,
      contentMarkdown,
      date: date || null,
      tags: tags || [],
      keywords: keywords || [],
    });

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la crearea notitei.' });
  }
});

// PUT /notes/:id
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notita nu exista sau nu este a ta.' });
    }

    const { title, contentMarkdown, date, tags, keywords } = req.body;
    if (title !== undefined) note.title = title;
    if (contentMarkdown !== undefined) note.contentMarkdown = contentMarkdown;
    if (date !== undefined) note.date = date;
    if (tags !== undefined) note.tags = tags;
    if (keywords !== undefined) note.keywords = keywords;

    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la actualizarea notitei.' });
  }
});

// DELETE /notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notita nu exista sau nu este a ta.' });
    }
    await note.destroy();
    res.json({ message: 'Notita stearsa.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la stergerea notitei.' });
  }
});

module.exports = router;


