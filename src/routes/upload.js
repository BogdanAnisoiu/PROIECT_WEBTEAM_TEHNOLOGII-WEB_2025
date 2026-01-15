const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

//configurare stocare multer
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        //generam un nume unic pentru fisier
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + '-' + file.originalname);
    },
});

const upload = multer({ storage });

//ruta post pentru incarcare (protejata de login)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Niciun fișier nu a fost încărcat.' });
        }
        //construim url-ul public
        const protocol = req.protocol;
        const host = req.get('host');
        //atentie: serverul pune folderul uploads la /uploads
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({ url: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la upload.' });
    }
});

module.exports = router;
