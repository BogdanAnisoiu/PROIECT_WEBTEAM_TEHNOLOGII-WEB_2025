const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotitaPartajata = sequelize.define('NotitaPartajata', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    notitaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    poateEdita: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'NotitePartajate'
  });

  return NotitaPartajata;
};
