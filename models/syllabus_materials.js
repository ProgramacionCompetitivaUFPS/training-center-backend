'use strict';
module.exports = (sequelize, DataTypes) => {
    var syllabus_materials = sequelize.define('syllabus_materials', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        material_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'materials',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        },
        syllabus_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'syllabuses',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        }
    }, {
        underscored: true,
        underscoredAll: true
    });
    syllabus_materials.associate = (models) => {

    }
    return syllabus_materials;
};