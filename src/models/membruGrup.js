const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MembruGrup = sequelize.define('MembruGrup', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        grupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rol: {
            type: DataTypes.STRING,
            defaultValue: 'membru' // 'admin', 'membru' (roluri)
        }
    }, {
        tableName: 'MembriGrup'
    });

    return MembruGrup;
};
