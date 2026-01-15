const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Curs = sequelize.define('Curs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nume: { //era nume
      type: DataTypes.STRING,
      allowNull: false,
    },
    an: { //era an
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 3 },
    },
    semestru: { //era semestru
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1, max: 2 },
    },
    specializareId: { //era specializare
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'Cursuri'
  });

  return Curs;
};
