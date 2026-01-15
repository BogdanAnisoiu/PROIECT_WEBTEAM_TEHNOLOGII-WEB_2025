const express = require('express');
const { GrupStudiu, MembruGrup, Student, Notita, NotitaGrup, NotitaPartajata } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

//1. creare grup
router.post('/', async (req, res) => {
    try {
        const { nume, descriere } = req.body;
        if (!nume) return res.status(400).json({ message: 'Numele grupului este obligatoriu.' });

        //creare grup
        const grup = await GrupStudiu.create({
            nume,
            descriere,
            adminId: req.user.id
        });

        //adaugam creatorul ca membru admin
        await MembruGrup.create({
            grupId: grup.id,
            studentId: req.user.id,
            rol: 'admin'
        });

        res.status(201).json(grup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la crearea grupului.' });
    }
});

//2. listare grupurile mele
router.get('/', async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.id, {
            include: [{
                model: GrupStudiu,
                as: 'grupuri',
                attributes: ['id', 'nume', 'descriere'],
                through: { attributes: ['rol'] } //include rolul in grup
            }]
        });
        res.json(student.grupuri);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la listarea grupurilor.' });
    }
});

//3. detalii grup (membri + notite) - doar daca esti membru
router.get('/:id', async (req, res) => {
    try {
        const grupId = req.params.id;

        //verificam accesul
        const membership = await MembruGrup.findOne({
            where: { grupId, studentId: req.user.id }
        });
        if (!membership) {
            return res.status(403).json({ message: 'Nu esti membru al acestui grup.' });
        }

        const grup = await GrupStudiu.findByPk(grupId, {
            include: [
                {
                    model: Student,
                    as: 'membri',
                    attributes: ['id', 'nume', 'prenume', 'email'],
                    through: { attributes: ['rol'] }
                },
                {
                    model: NotitaGrup,
                    as: 'listaNotiteGrup',
                    include: [
                        { model: Student, as: 'autorPartajare', attributes: ['nume', 'prenume'] },
                        {
                            model: Notita
                        }
                    ]
                }
            ]
        });

        if (!grup) return res.status(404).json({ message: 'Grup inexistent.' });

        res.json(grup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la preluarea detaliilor grupului.' });
    }
});

//4. invita membru in grup (dupa cod colaborare)
router.post('/:id/invita', async (req, res) => {
    try {
        const grupId = req.params.id;
        const { codColaborare } = req.body;

        if (!codColaborare) {
            return res.status(400).json({ message: 'Codul de colaborare este obligatoriu.' });
        }

        //verificam daca solicitantul este membru
        const membership = await MembruGrup.findOne({ where: { grupId, studentId: req.user.id } });
        if (!membership) return res.status(403).json({ message: 'Nu ai dreptul sa inviti.' });

        //cautam studentul
        const student = await Student.findOne({ where: { codColaborare } });
        if (!student) {
            return res.status(404).json({ message: 'Nu exista student cu acest cod.' });
        }

        //adaugam noul membru
        const existing = await MembruGrup.findOne({ where: { grupId, studentId: student.id } });
        if (existing) return res.status(400).json({ message: 'Studentul este deja in grup.' });

        await MembruGrup.create({
            grupId,
            studentId: student.id,
            rol: 'membru'
        });

        res.json({ message: 'Membru adaugat cu succes.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la invitarea membrului.' });
    }
});

//5. partajeaza notita in grup
router.post('/:id/notite', async (req, res) => {
    try {
        const grupId = req.params.id;
        const { notitaId } = req.body;

        const membership = await MembruGrup.findOne({ where: { grupId, studentId: req.user.id } });
        if (!membership) return res.status(403).json({ message: 'Nu esti membru.' });

        //verificam daca notita apartine utilizatorului
        const notita = await Notita.findByPk(notitaId);
        if (!notita || notita.studentId !== req.user.id) {
            return res.status(400).json({ message: 'Poti partaja doar notitele tale.' });
        }

        //verificam duplicat
        const exists = await NotitaGrup.findOne({ where: { grupId, notitaId } });
        if (exists) return res.status(400).json({ message: 'Notita este deja in grup.' });

        await NotitaGrup.create({
            grupId,
            notitaId,
            partajatDe: req.user.id
        });

        res.json({ message: 'Notita partajata in grup.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la partajarea notitei.' });
    }
});

module.exports = router;
