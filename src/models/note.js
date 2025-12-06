const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('curs', 'seminar'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentMarkdown: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('tags');
        return raw ? raw.split(',') : [];
      },
      set(value) {
        this.setDataValue('tags', Array.isArray(value) ? value.join(',') : value);
      },
    },
    keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('keywords');
        return raw ? raw.split(',') : [];
      },
      set(value) {
        this.setDataValue('keywords', Array.isArray(value) ? value.join(',') : value);
      },
    },
  });

  return Note;
};


