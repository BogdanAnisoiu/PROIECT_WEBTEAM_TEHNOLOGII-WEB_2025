const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Specializare = sequelize.define('Specializare', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nume: {
            type: DataTypes.ENUM('INFORMATICA ECONOMICA', 'CIBERNETICA', 'STATISTICA ECONOMICA'),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'Specializari'
    });

    return Specializare;
};
