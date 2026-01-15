const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { sequelize } = require('./models');
const ruteAutentificare = require('./routes/autentificare');
const ruteStudenti = require('./routes/studenti');
const ruteCursuri = require('./routes/cursuri');
const ruteNotite = require('./routes/notite');
const rutePartajare = require('./routes/partajare');
const ruteGrupuri = require('./routes/grupuri');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'API proiectWEB backend este pornit.' });
});

app.use('/autentificare', ruteAutentificare);
app.use('/studenti', ruteStudenti);
app.use('/cursuri', ruteCursuri);
app.use('/notite', ruteNotite);
app.use('/partajare', rutePartajare);
app.use('/grupuri', ruteGrupuri);
app.use('/incarcare', require('./routes/upload'));

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();

    // Disable foreign keys specifically for SQLite to allow alter
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    // Update specific models to modify schema without breaking others
    if (sequelize.models.CererePrietenie) {
      await sequelize.models.CererePrietenie.sync({ alter: true });
    }
    if (sequelize.models.Notita) {
      await sequelize.models.Notita.sync({ alter: true });
    }

    await sequelize.query('PRAGMA foreign_keys = ON;');

    // Sync other models without altering (safe)
    // validation: false allows skipping checks if tables essentially match
    await sequelize.sync();

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


