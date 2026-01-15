const express = require('express');
const { Student, CererePrietenie, Specializare, Notita, NotitaPartajata } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

const router = express.Router();

router.use(authMiddleware);

//ruta pentru obtinerea profilului studentului conectat
router.get('/profil', async (req, res) => {
  try {
    const student = await Student.findByPk(req.user.id, {
      attributes: ['id', 'email', 'prenume', 'nume', 'specializareId', 'codColaborare'],
      include: [{ model: Specializare, as: 'specializare' }]
    });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la profil.' });
  }
});

//ruta pentru trimiterea unei cereri de prietenie folosind codul de colaborare
router.post('/cereri-prietenie', async (req, res) => {
  try {
    const { codColaborare, poateEdita } = req.body;
    if (!codColaborare) {
      return res.status(400).json({ message: 'Codul de colaborare este obligatoriu.' });
    }
    const receiver = await Student.findOne({ where: { codColaborare } });
    if (!receiver) {
      return res.status(404).json({ message: 'Nu exista utilizator cu acest cod.' });
    }
    if (receiver.id === req.user.id) {
      return res.status(400).json({ message: 'Nu iti poti trimite cerere tie insuti.' });
    }

    const existing = await CererePrietenie.findOne({
      where: { expeditorId: req.user.id, destinatarId: receiver.id, status: 'pending' },
    });
    if (existing) {
      return res.status(400).json({ message: 'Exista deja o cerere in asteptare.' });
    }

    const fr = await CererePrietenie.create({
      expeditorId: req.user.id,
      destinatarId: receiver.id,
      poateEdita: !!poateEdita,
    });

    res.status(201).json(fr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la trimiterea cererii de prietenie.' });
  }
});

//ruta pentru listarea cererilor de prietenie primite
router.get('/cereri-prietenie', async (req, res) => {
  try {
    const requests = await CererePrietenie.findAll({
      where: { destinatarId: req.user.id, status: 'pending' },
      include: [{ model: Student, as: 'expeditor', attributes: ['id', 'prenume', 'nume', 'email'] }],
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea cererilor.' });
  }
});


//ruta pentru obtinerea listei de prieteni
router.get('/prieteni', async (req, res) => {
  try {
    //folosim relatia 'prieteni' definita in index.js
    const student = await Student.findByPk(req.user.id, {
      include: [{
        model: Student,
        as: 'prieteni',
        attributes: ['id', 'prenume', 'nume', 'email', 'codColaborare']
      }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.json(student.prieteni);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la listarea prietenilor.' });
  }
});

//ruta pentru acceptarea unei cereri de prietenie
router.post('/cereri-prietenie/:id/accepta', async (req, res) => {
  try {
    const fr = await CererePrietenie.findByPk(req.params.id);
    if (!fr || fr.destinatarId !== req.user.id) {
      return res.status(404).json({ message: 'Cerere inexistenta sau nu iti este adresata.' });
    }
    fr.status = 'accepted';
    await fr.save();

    const student = await Student.findByPk(fr.destinatarId);
    const expeditor = await Student.findByPk(fr.expeditorId);

    //adaugam relatia de prietenie (bidirectional)
    if (student && expeditor) {
      if (student.addPrieten) {
        await student.addPrieten(expeditor);
        await expeditor.addPrieten(student);
      } else if (student.addPrieteni) {
        await student.addPrieteni([expeditor]);
        await expeditor.addPrieteni([student]);
      } else {
        console.error("Nu am gasit metoda addPrieten sau addPrieteni pe modelul Student.");
      }
    }

    res.json({ message: 'Cerere acceptata.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la acceptarea cererii.' });
  }
});

//ruta pentru respingerea unei cereri de prietenie
router.post('/cereri-prietenie/:id/respinge', async (req, res) => {
  try {
    const fr = await CererePrietenie.findByPk(req.params.id);
    if (!fr || fr.destinatarId !== req.user.id) {
      return res.status(404).json({ message: 'Cerere inexistenta.' });
    }
    fr.status = 'rejected';
    await fr.save();
    res.json({ message: 'Cerere respinsa.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la respingerea cererii.' });
  }
});

//ruta pentru stergerea unui prieten
router.delete('/prieteni/:id', async (req, res) => {
  try {
    const friendId = req.params.id;
    const userId = req.user.id;

    const currentUser = await Student.findByPk(userId);
    const friend = await Student.findByPk(friendId);

    if (!currentUser || !friend) {
      return res.status(404).json({ message: 'Utilizator nu a fost gasit.' });
    }

    //1. stergem cererile de prietenie 
    //cautam cereri intre cei doi indiferent de directie
    await CererePrietenie.destroy({
      where: {
        [Op.or]: [
          { expeditorId: userId, destinatarId: friendId },
          { expeditorId: friendId, destinatarId: userId }
        ]
      }
    });

    //2. stergem prietenia (bidirectional)
    //folosim o abordare safe verificand metodele
    if (currentUser.removePrieten) {
      await currentUser.removePrieten(friend);
    } else if (currentUser.removePrieteni) {
      await currentUser.removePrieteni(friend);
    }

    if (friend.removePrieten) {
      await friend.removePrieten(currentUser);
    } else if (friend.removePrieteni) {
      await friend.removePrieteni(currentUser);
    }

    //3. stergem notitele partajate

    //a) notite ale userului partajate cu prietenul
    const userNotes = await Notita.findAll({ where: { studentId: userId }, attributes: ['id'] });
    const userNoteIds = userNotes.map(n => n.id);
    if (userNoteIds.length > 0) {
      await NotitaPartajata.destroy({
        where: {
          studentId: friendId,
          notitaId: { [Op.in]: userNoteIds }
        }
      });
    }

    //b) notite ale prietenului partajate cu userul
    const friendNotes = await Notita.findAll({ where: { studentId: friendId }, attributes: ['id'] });
    const friendNoteIds = friendNotes.map(n => n.id);
    if (friendNoteIds.length > 0) {
      await NotitaPartajata.destroy({
        where: {
          studentId: userId,
          notitaId: { [Op.in]: friendNoteIds }
        }
      });
    }

    res.json({ message: 'Prieten si partajarile sterse cu succes.' });
  } catch (err) {
    console.error('Eroare DELETE friend:', err);
    res.status(500).json({ message: 'Eroare server: ' + err.message });
  }
});

module.exports = router;
