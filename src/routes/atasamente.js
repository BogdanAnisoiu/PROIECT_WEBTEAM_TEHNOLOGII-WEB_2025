const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Atasament, Notita } = require('../models');
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

//ruta pentru incarcare atasament
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { notitaId } = req.body;
    const notita = await Notita.findByPk(notitaId);
    if (!notita || notita.studentId !== req.user.id) {
      return res.status(404).json({ message: 'Notita nu exista sau nu este a ta.' });
    }

    const file = req.file;
    const att = await Atasament.create({
      notitaId: notita.id,
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

//ruta pentru descarcare atasament
router.get('/:id/download', async (req, res) => {
  try {
    const att = await Atasament.findByPk(req.params.id, { include: [{ model: Notita, as: 'notita' }] });
    if (!att || att.notita.studentId !== req.user.id) {
      return res.status(404).json({ message: 'Atasament inexistent sau fara acces.' });
    }
    const fullPath = path.join(uploadDir, att.filePath);
    res.download(fullPath, att.fileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la descarcarea fisierului.' });
  }
});

//ruta pentru stergere atasament
router.delete('/:id', async (req, res) => {
  try {
    const att = await Atasament.findByPk(req.params.id, { include: [{ model: Notita, as: 'notita' }] });
    if (!att || att.notita.studentId !== req.user.id) {
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
