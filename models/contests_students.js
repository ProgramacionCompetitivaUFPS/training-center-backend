'use strict';

/**
 * Contests students Model
 */

/**
 * Instance a contest student model
 * @param {any} sequelize
 * @param {any} DataTypes
 * @returns
 */

module.exports = (sequelize, DataTypes) => {
    var contests_students = sequelize.define('contests_students', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        contest_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'contests',
                key: 'id',
                onDelete: 'CASCADE'
            },
            allowNull: false,
            unique: 'UK01'
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
                onDelete: 'CASCADE'
            },
            allowNull: false,
            unique: 'UK01'
        }
    }, {

        underscored: true,
        underscoredAll: true
    });

    contests_students.associate = (models) => {

    }
    return contests_students;
};