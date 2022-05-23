'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    var users_teams = sequelize.define('users_teams', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        },
        team_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'teams',
                key: 'id'
            },
            allowNull: false,
            unique: 'UK01'
        },
        team_id: DataTypes.INTEGER
    }, {
        underscored: true,
        underscoredAll: true
    });

    // Class methods

    users_teams.associate = (models) => {

    }

    return users_teams;
};