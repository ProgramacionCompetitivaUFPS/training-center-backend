'use strict';

/**
 * Asignements problems Model
 */

/**
 * Instance a Asignements problems model
 * @param {any} sequelize
 * @param {any} DataTypes
 * @returns
 */


module.exports = (sequelize, DataTypes) => {
    var assignment_problems = sequelize.define('assignment_problems', {
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
        assignment_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'assignments',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        }
    }, {
        underscored: true,
        underscoredAll: true
    });

    //Class methods

    assignment_problems.associate = function(models) {
        // associations can be defined here
    }

    return assignment_problems;
};