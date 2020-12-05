'use strict';
module.exports = (sequelize, DataTypes) => {
    var syllabus_students = sequelize.define('syllabus_students', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        syllabus_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'syllabuses',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        }
    }, {
        underscored: true,
        underscoredAll: true
    });

    syllabus_students.associate = (models) => {

    }
    return syllabus_students;
};