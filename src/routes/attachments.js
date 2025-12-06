const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Attachment, Note } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.use(authMiddleware);

// POST /attachments/upload (multipart/form-data: file, noteId)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { noteId } = req.body;
    const note = await Note.findByPk(noteId);
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notita nu exista sau nu este a ta.' });
    }

    const file = req.file;
    const att = await Attachment.create({
      noteId: note.id,
      fileName: file.originalname,
      mimeType: file.mimetype,
      filePath: file.filename,
    });

    res.status(201).json(att);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la upload atasament.' });
  }
});

// GET /attachments/:id/download
router.get('/:id/download', async (req, res) => {
  try {
    const att = await Attachment.findByPk(req.params.id, { include: [{ model: Note, as: 'note' }] });
    if (!att || att.note.userId !== req.user.id) {
      return res.status(404).json({ message: 'Atasament inexistent sau fara acces.' });
    }
    const fullPath = path.join(uploadDir, att.filePath);
    res.download(fullPath, att.fileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la descarcarea fisierului.' });
  }
});

// DELETE /attachments/:id
router.delete('/:id', async (req, res) => {
  try {
    const att = await Attachment.findByPk(req.params.id, { include: [{ model: Note, as: 'note' }] });
    if (!att || att.note.userId !== req.user.id) {
      return res.status(404).json({ message: 'Atasament inexistent sau fara acces.' });
    }
    const fullPath = path.join(uploadDir, att.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    await att.destroy();
    res.json({ message: 'Atasament sters.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la stergerea atasamentului.' });
  }
});

module.exports = router;


