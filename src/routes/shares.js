const express = require('express');
const { Share, Note, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// POST /shares  { noteId, userIds:[], canEdit }
router.post('/', async (req, res) => {
  try {
    const { noteId, userIds, canEdit } = req.body;
    if (!noteId || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'noteId si userIds sunt obligatorii.' });
    }

    const note = await Note.findByPk(noteId);
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notita nu exista sau nu este a ta.' });
    }

    const records = await Promise.all(
      userIds.map((uid) =>
        Share.create({
          noteId,
          userId: uid,
          canEdit: !!canEdit,
        })
      )
    );

    res.status(201).json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la partajarea notitei.' });
  }
});

// GET /shares/received
router.get('/received', async (req, res) => {
  try {
    const shares = await Share.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Note,
          include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }],
        },
      ],
    });
    res.json(shares);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea notitelor primite.' });
  }
});

// GET /shares/sent
router.get('/sent', async (req, res) => {
  try {
    const notes = await Note.findAll({ where: { userId: req.user.id } });
    const noteIds = notes.map((n) => n.id);
    const shares = await Share.findAll({
      where: { noteId: noteIds },
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Note },
      ],
    });
    res.json(shares);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea notitelor distribuite.' });
  }
});

module.exports = router;


