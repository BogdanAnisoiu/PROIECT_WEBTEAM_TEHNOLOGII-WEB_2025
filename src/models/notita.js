const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notita = sequelize.define('Notita', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cursId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tip: {
      type: DataTypes.ENUM('curs', 'seminar'),
      allowNull: false,
    },
    titlu: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    continut: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cuvinteCheie: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('cuvinteCheie');
        return raw ? raw.split(',') : [];
      },
      set(value) {
        this.setDataValue('cuvinteCheie', Array.isArray(value) ? value.join(',') : value);
      },
    },
  }, {
    tableName: 'Notite'
  });

  return Notita;
};
