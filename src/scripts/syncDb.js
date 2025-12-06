const { sequelize, Course } = require('../models');

async function main() {
  try {
    await sequelize.sync({ alter: true });

    // Seed cursuri de baza
    const defaults = [
      { name: 'Programare Web', year: 2, specialization: 'CIB' },
      { name: 'Baze de Date', year: 2, specialization: 'CIB' },
      { name: 'Matematica', year: 1, specialization: 'CIB' },
      { name: 'Algoritmi', year: 1, specialization: 'CIB' },
    ];

    for (const c of defaults) {
      await Course.findOrCreate({ where: c });
    }

    console.log('Baza de date sincronizata si seed completat.');
    process.exit(0);
  } catch (err) {
    console.error('Eroare la sync DB:', err);
    process.exit(1);
  }
}

main();


