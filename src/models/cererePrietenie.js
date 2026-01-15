const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CererePrietenie = sequelize.define('CererePrietenie', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    expeditorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    destinatarId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    poateEdita: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'CereriPrietenie'
  });

  return CererePrietenie;
};
