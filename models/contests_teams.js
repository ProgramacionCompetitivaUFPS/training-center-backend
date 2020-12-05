'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    var contests_teams = sequelize.define('contests_teams', {
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
        team_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'teams',
                key: 'id',
                onDelete: 'CASCADE'
            },
            allowNull: false,
            unique: 'UK01'
        }
    }, {
        underscored: true,
        underscoredAll: true,
    });


    contests_teams.associate = (models) => {

    }

    return contests_teams;
};