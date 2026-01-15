const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'database_ro.sqlite'), //baza de date noua
  logging: false,
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Specializare = require('./specializare')(sequelize);
db.Student = require('./student')(sequelize);
db.CererePrietenie = require('./cererePrietenie')(sequelize);
db.Curs = require('./curs')(sequelize);
db.Notita = require('./notita')(sequelize);
db.NotitaPartajata = require('./notitaPartajata')(sequelize);
db.GrupStudiu = require('./grupStudiu')(sequelize);
db.MembruGrup = require('./membruGrup')(sequelize);
db.NotitaGrup = require('./notitaGrup')(sequelize);

//relatii specializare
db.Specializare.hasMany(db.Student, { foreignKey: 'specializareId', as: 'studenti' });
db.Student.belongsTo(db.Specializare, { foreignKey: 'specializareId', as: 'specializare' });

db.Specializare.hasMany(db.Curs, { foreignKey: 'specializareId', as: 'cursuri' });
db.Curs.belongsTo(db.Specializare, { foreignKey: 'specializareId', as: 'specializare' });

//relatii student - notita
db.Student.hasMany(db.Notita, { foreignKey: 'studentId', as: 'notite' });
db.Notita.belongsTo(db.Student, { foreignKey: 'studentId', as: 'autor' });

//relatii curs - notita
db.Curs.hasMany(db.Notita, { foreignKey: 'cursId', as: 'notite' });
db.Notita.belongsTo(db.Curs, { foreignKey: 'cursId', as: 'curs' });

//relatii prietenie (auto-referinta)
db.Student.belongsToMany(db.Student, {
  as: 'prieteni',
  through: 'StudentiPrieteni',
  foreignKey: 'studentId',
  otherKey: 'prietenId',
});

//cereri prietenie
db.Student.hasMany(db.CererePrietenie, { foreignKey: 'destinatarId', as: 'cereriPrimite' });
db.Student.hasMany(db.CererePrietenie, { foreignKey: 'expeditorId', as: 'cereriTrimise' });
db.CererePrietenie.belongsTo(db.Student, { foreignKey: 'destinatarId', as: 'destinatar' });
db.CererePrietenie.belongsTo(db.Student, { foreignKey: 'expeditorId', as: 'expeditor' });

//partajare
db.Notita.belongsToMany(db.Student, {
  through: db.NotitaPartajata,
  as: 'partajataCu',
  foreignKey: 'notitaId',
  otherKey: 'studentId',
});
db.Student.belongsToMany(db.Notita, {
  through: db.NotitaPartajata,
  as: 'notitePartajate',
  foreignKey: 'studentId',
  otherKey: 'notitaId',
});

//relatii explicite pentru notitapartajata pentru a permite interogarea directa
db.NotitaPartajata.belongsTo(db.Notita, { foreignKey: 'notitaId' });
db.Notita.hasMany(db.NotitaPartajata, { foreignKey: 'notitaId' });

db.NotitaPartajata.belongsTo(db.Student, { foreignKey: 'studentId' });
db.Student.hasMany(db.NotitaPartajata, { foreignKey: 'studentId' });

// --- RELATII GRUPURI STUDIU ---

//grup - membri
db.GrupStudiu.belongsToMany(db.Student, { through: db.MembruGrup, as: 'membri', foreignKey: 'grupId', otherKey: 'studentId' });
db.Student.belongsToMany(db.GrupStudiu, { through: db.MembruGrup, as: 'grupuri', foreignKey: 'studentId', otherKey: 'grupId' });

//grup - admin
db.GrupStudiu.belongsTo(db.Student, { as: 'admin', foreignKey: 'adminId' });

//grup - notite
db.GrupStudiu.belongsToMany(db.Notita, { through: db.NotitaGrup, as: 'notiteGrup', foreignKey: 'grupId', otherKey: 'notitaId' });
db.Notita.belongsToMany(db.GrupStudiu, { through: db.NotitaGrup, as: 'grupuri', foreignKey: 'notitaId', otherKey: 'grupId' });

//notitagrup relatii explicite pentru interogare mai usoara
db.GrupStudiu.hasMany(db.NotitaGrup, { foreignKey: 'grupId', as: 'listaNotiteGrup' });
db.NotitaGrup.belongsTo(db.GrupStudiu, { foreignKey: 'grupId' });

db.NotitaGrup.belongsTo(db.Notita, { foreignKey: 'notitaId' });
db.NotitaGrup.belongsTo(db.Student, { foreignKey: 'partajatDe', as: 'autorPartajare' });

module.exports = db;
