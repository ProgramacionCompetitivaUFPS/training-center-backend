'use strict';

/**
 * Contests problems Model
 */

/**
 * Instance a constest problem model
 * @param {any} sequelize
 * @param {any} DataTypes
 * @returns
 */

module.exports = (sequelize, DataTypes) => {

    var contests_problems = sequelize.define('contests_problems', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        problem_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'problems',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        },
        contest_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'contests',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        }
    }, {
        underscored: true,
        underscoredAll: true
    });

    // Class methods

    contests_problems.associate = (models) => {

    }

    return contests_problems;
};