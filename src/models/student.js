const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    prenume: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nume: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //relatie cu specializare
    specializareId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parolaHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codColaborare: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => uuidv4().split('-')[0],
    },
  }, {
    tableName: 'Studenti'
  });

  return Student;
};


