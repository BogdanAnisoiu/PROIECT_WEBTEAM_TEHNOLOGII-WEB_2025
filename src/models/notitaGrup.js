const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const NotitaGrup = sequelize.define('NotitaGrup', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        grupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        notitaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        partajatDe: {
            type: DataTypes.INTEGER, //studentid care a pus notita
            allowNull: false,
        }
    }, {
        tableName: 'NotiteGrup'
    });

    return NotitaGrup;
};
