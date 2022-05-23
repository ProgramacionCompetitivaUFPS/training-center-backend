'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    var reports_forums = sequelize.define('reports_forums', {
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
                key: 'id',
                onDelete: 'CASCADE'
            },
            allowNull: false,
            unique: 'UK01'
        },
        forum_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'forums',
                key: 'id',
                onDelete: 'CASCADE'
            },
            allowNull: false,
            unique: 'UK01'
        },
        reason: {
            type: DataTypes.TEXT
        }
    }, {
        underscored: true,
        underscoredAll: true,
    });

    //class methods
    reports_forums.associate = (models) => {

        reports_forums.belongsTo(models.users)
    }

    return reports_forums;
};