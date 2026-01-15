const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GrupStudiu = sequelize.define('GrupStudiu', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nume: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descriere: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'GrupuriStudiu'
    });

    return GrupStudiu;
};
