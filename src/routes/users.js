const express = require('express');
const { User, FriendRequest } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// GET /users/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'specialization', 'collaborationCode'],
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la profil.' });
  }
});

// POST /users/friend-requests  { collaborationCode }
router.post('/friend-requests', async (req, res) => {
  try {
    const { collaborationCode } = req.body;
    const receiver = await User.findOne({ where: { collaborationCode } });
    if (!receiver) {
      return res.status(404).json({ message: 'Nu exista utilizator cu acest cod.' });
    }
    if (receiver.id === req.user.id) {
      return res.status(400).json({ message: 'Nu iti poti trimite cerere tie insuti.' });
    }

    const existing = await FriendRequest.findOne({
      where: { senderId: req.user.id, receiverId: receiver.id, status: 'pending' },
    });
    if (existing) {
      return res.status(400).json({ message: 'Exista deja o cerere in asteptare.' });
    }

    const fr = await FriendRequest.create({
      senderId: req.user.id,
      receiverId: receiver.id,
    });

    res.status(201).json(fr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la trimiterea cererii de prietenie.' });
  }
});

// GET /users/friend-requests (primite)
router.get('/friend-requests', async (req, res) => {
  try {
    const requests = await FriendRequest.findAll({
      where: { receiverId: req.user.id, status: 'pending' },
      include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea cererilor.' });
  }
});

// POST /users/friend-requests/:id/accept
router.post('/friend-requests/:id/accept', async (req, res) => {
  try {
    const fr = await FriendRequest.findByPk(req.params.id);
    if (!fr || fr.receiverId !== req.user.id) {
      return res.status(404).json({ message: 'Cerere inexistenta.' });
    }
    fr.status = 'accepted';
    await fr.save();

    const user = await User.findByPk(fr.receiverId);
    const sender = await User.findByPk(fr.senderId);
    await user.addFriend(sender);
    await sender.addFriend(user);

    res.json({ message: 'Cerere acceptata.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la acceptarea cererii.' });
  }
});

// POST /users/friend-requests/:id/reject
router.post('/friend-requests/:id/reject', async (req, res) => {
  try {
    const fr = await FriendRequest.findByPk(req.params.id);
    if (!fr || fr.receiverId !== req.user.id) {
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

// GET /users/friends
router.get('/friends', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const friends = await user.getFriends({
      attributes: ['id', 'firstName', 'lastName', 'email', 'collaborationCode'],
    });
    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la listarea prietenilor.' });
  }
});

module.exports = router;


