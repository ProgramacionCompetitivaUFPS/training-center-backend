'use strict';

/**
 * Assignements Model
 */

/**
 * Instance a assignement model
 * @param {any} sequelize
 * @param {any} DataTypes
 * @returns
 */

module.exports = (sequelize, DataTypes) => {
    var Assignments = sequelize.define('assignments', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        tittle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        init_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        syllabus_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'syllabuses',
                key: 'id'
            }
        }
    }, {
        underscored: true,
        underscoredAll: true
    });

    //Class methods

    Assignments.associate = function(models) {
        Assignments.belongsTo(models.syllabuses)

        Assignments.belongsToMany(models.problems, {
            through: 'assignment_problems',
            as: 'problems'
        })

    }
    return Assignments;
};