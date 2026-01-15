const { sequelize, Specializare, Curs } = require('../models');

async function seed() {
    try {
        await sequelize.sync({ force: true }); // RESET COMPLET AL BAZEI DE DATE
        console.log('Baza de date a fost resetata.');

        // 1. Creare Specializari
        const specializariData = [
            { nume: 'INFORMATICA ECONOMICA' },
            { nume: 'CIBERNETICA ECONOMICA' },
            { nume: 'STATISTICA SI PREVIZIUNE ECONOMICA' }
        ];

        const specializari = await Specializare.bulkCreate(specializariData);

        const ie = specializari.find(s => s.nume === 'INFORMATICA ECONOMICA');
        const cib = specializari.find(s => s.nume === 'CIBERNETICA ECONOMICA');
        const stat = specializari.find(s => s.nume === 'STATISTICA SI PREVIZIUNE ECONOMICA');

        // ==== TRUNCHI COMUN (An 1 & An 2 Sem 1) - Pentru TOATE specializarile ====
        const trunchiComun = [
            // An 1 Sem 1
            { nume: 'Economie', an: 1, semestru: 1 },
            { nume: 'Algebra', an: 1, semestru: 1 },
            { nume: 'Bazele Statisticii', an: 1, semestru: 1 },
            { nume: 'Bazele Cercetarii Operationale', an: 1, semestru: 1 },
            { nume: 'Bazele Tehnologiei Informatiei', an: 1, semestru: 1 },
            { nume: 'Bazele Programarii Calculatoarelor', an: 1, semestru: 1 },
            { nume: 'Limba Engleza', an: 1, semestru: 1 },

            // An 1 Sem 2
            { nume: 'Analiza Matematica', an: 1, semestru: 2 },
            { nume: 'Statistica', an: 1, semestru: 2 },
            { nume: 'Algoritmi si Tehnici de Programare', an: 1, semestru: 2 },
            { nume: 'Sisteme de Operare', an: 1, semestru: 2 },
            { nume: 'Bazele Ciberneticii Economice', an: 1, semestru: 2 },
            { nume: 'Marketing', an: 1, semestru: 2 },
            { nume: 'Contabilitate', an: 1, semestru: 2 },

            // An 2 Sem 1
            { nume: 'Programare Orientata Obiect', an: 2, semestru: 1 },
            { nume: 'Baze de Date', an: 2, semestru: 1 },
            { nume: 'Statistica Macroeconomica', an: 2, semestru: 1 },
            { nume: 'Probabilitati si Statistica Matematica', an: 2, semestru: 1 },
            { nume: 'Microeconomie Cantitativa', an: 2, semestru: 1 },
            { nume: 'Management', an: 2, semestru: 1 },
            { nume: 'Finante', an: 2, semestru: 1 }
        ];

        // ==== INFORMATICA ECONOMICA ====
        const materiiIE = [
            // An 2 Sem 2
            { nume: 'Programarea Aplicatiilor Windows', an: 2, semestru: 2 },
            { nume: 'Macroeconomie Cantitativa', an: 2, semestru: 2 },
            { nume: 'Programare Evolutiva si Algoritmi Genetici', an: 2, semestru: 2 },
            { nume: 'Structuri de Date', an: 2, semestru: 2 },
            { nume: 'Java', an: 2, semestru: 2 },
            { nume: 'SGBD Oracle', an: 2, semestru: 2 },
            { nume: 'Practica de Specialitate', an: 2, semestru: 2 },

            // An 3 Sem 1
            { nume: 'Econometrie', an: 3, semestru: 1 },
            { nume: 'Analiza si Proiectarea Sistemelor Informatice', an: 3, semestru: 1 },
            { nume: 'Dispozitive si Aplicatii Mobile', an: 3, semestru: 1 },
            { nume: 'Multimedia', an: 3, semestru: 1 },
            { nume: 'Dezvoltarea Software pentru Analiza Datelor', an: 3, semestru: 1 },
            { nume: 'Tehnologii Web', an: 3, semestru: 1 },

            // An 3 Sem 2
            { nume: 'Sociologie', an: 3, semestru: 2 },
            { nume: 'Serii de Timp', an: 3, semestru: 2 },
            { nume: 'Retele de Calculatoare', an: 3, semestru: 2 },
            { nume: 'Pachete Software', an: 3, semestru: 2 },
            { nume: 'Sisteme Informationale Economice', an: 3, semestru: 2 },
            { nume: 'Calitate si Testare Software', an: 3, semestru: 2 }
        ];

        // ==== CIBERNETICA ECONOMICA ====
        const materiiCib = [
            // An 2 Sem 2
            { nume: 'Analiza si Diagnoza Sistemelor Economice', an: 2, semestru: 2 },
            { nume: 'Macroeconomie Cantitativa', an: 2, semestru: 2 },
            { nume: 'Teoria Deciziei', an: 2, semestru: 2 },
            { nume: 'Simularea Proceselor Economice', an: 2, semestru: 2 },
            { nume: 'Econometrie', an: 2, semestru: 2 },
            { nume: 'Microeconomie Manageriala', an: 2, semestru: 2 },
            { nume: 'Practica de Specialitate', an: 2, semestru: 2 },

            // An 3 Sem 1
            { nume: 'Cibernetica Sistemelor Economice', an: 3, semestru: 1 },
            { nume: 'Cercetari Operationale', an: 3, semestru: 1 },
            { nume: 'Economia si Gestiunea Riscului', an: 3, semestru: 1 },
            { nume: 'Sisteme Suport de Decizie', an: 3, semestru: 1 },
            { nume: 'Analiza Datelor', an: 3, semestru: 1 },
            { nume: 'Dinamica Sistemelor Economice', an: 3, semestru: 1 },

            // An 3 Sem 2
            { nume: 'Sociologie', an: 3, semestru: 2 },
            { nume: 'Serii de Timp', an: 3, semestru: 2 },
            { nume: 'Sisteme Informationale pentru Conducere', an: 3, semestru: 2 },
            { nume: 'Pachete Software', an: 3, semestru: 2 },
            { nume: 'Teoria Jocurilor', an: 3, semestru: 2 },
            { nume: 'Inteligenta Computationala in Economie', an: 3, semestru: 2 }
        ];

        // ==== STATISTICA ====
        const materiiStat = [
            // An 2 Sem 2
            { nume: 'Pachete Software', an: 2, semestru: 2 },
            { nume: 'Statistica Neparametrica', an: 2, semestru: 2 },
            { nume: 'Econometrie', an: 2, semestru: 2 },
            { nume: 'Statistica Spatiala', an: 2, semestru: 2 },
            { nume: 'Testarea Ipotezelor Statistice', an: 2, semestru: 2 },
            { nume: 'Macroeconomie Cantitativa', an: 2, semestru: 2 },
            { nume: 'Practica de Specialitate', an: 2, semestru: 2 },

            // An 3 Sem 1
            { nume: 'Modelarea si Vizualizarea Geospatiala a Datelor Statistice', an: 3, semestru: 1 },
            { nume: 'Controlul Statistic al Calitatii', an: 3, semestru: 1 },
            { nume: 'Analiza Statistica Multidimensionala', an: 3, semestru: 1 },
            { nume: 'Sondaje si Anchete Statistice', an: 3, semestru: 1 },
            { nume: 'Demografie', an: 3, semestru: 1 },
            { nume: 'Teoria Jocurilor', an: 3, semestru: 1 },

            // An 3 Sem 2
            { nume: 'Previziune Economica', an: 3, semestru: 2 },
            { nume: 'Statistica Pietelor Financiare', an: 3, semestru: 2 },
            { nume: 'Serii de Timp', an: 3, semestru: 2 },
            { nume: 'Statistica Microeconomica', an: 3, semestru: 2 },
            { nume: 'Sociologie', an: 3, semestru: 2 },
            { nume: 'Proiectarea Sistemelor Informatice in Statistica', an: 3, semestru: 2 }
        ];


        let cursuriDeSalvat = [];

        // Adaugare Trunchi Comun la toate specializarile
        const toateSpecializarile = [ie, cib, stat];
        trunchiComun.forEach(materie => {
            toateSpecializarile.forEach(spec => {
                cursuriDeSalvat.push({ ...materie, specializareId: spec.id });
            });
        });

        // Adaugare Materii Specifice
        materiiIE.forEach(m => cursuriDeSalvat.push({ ...m, specializareId: ie.id }));
        materiiCib.forEach(m => cursuriDeSalvat.push({ ...m, specializareId: cib.id }));
        materiiStat.forEach(m => cursuriDeSalvat.push({ ...m, specializareId: stat.id }));

        await Curs.bulkCreate(cursuriDeSalvat);

        console.log(`Baza de date a fost populata cu ${cursuriDeSalvat.length} cursuri!`);
        process.exit(0);
    } catch (err) {
        console.error('Eroare la populare:', err);
        process.exit(1);
    }
}

seed();
