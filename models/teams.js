'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    var teams = sequelize.define('teams', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: 3,
                    msg: "El campo nombre no puede ser vacio."
                }
            }
        },
        total_submissions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        accepted_submissions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        underscored: true,
        underscoredAll: true,
    });

    teams.associate = (models) => {
        teams.belongsToMany(models.users, {
            through: 'users_teams',
            as: 'users',
            onDelete: 'CASCADE'
        })

        teams.belongsToMany(models.contests, {
            through: 'contests_teams',
            as: 'contests',
            onDelete: 'CASCADE'
        })
    }
    return teams;
};