const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const noteRoutes = require('./routes/notes');
const attachmentRoutes = require('./routes/attachments');
const shareRoutes = require('./routes/shares');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'API proiectWEB backend este pornit.' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/notes', noteRoutes);
app.use('/attachments', attachmentRoutes);
app.use('/shares', shareRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexiune la baza de date realizata cu succes.');

    app.listen(PORT, () => {
      console.log(`Server pornit pe portul ${PORT}`);
    });
  } catch (err) {
    console.error('Eroare la pornirea serverului:', err);
    process.exit(1);
  }
}

start();


