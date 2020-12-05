'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    var problems_tags = sequelize.define('problems_tags', {
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
                key: 'id',
                onDelete: 'CASCADE'
            },
            allowNull: false,
            unique: 'UK01'
        },
        tag_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'tags',
                key: 'id',
                onDelete: 'CASCADE'
            },
            allowNull: false,
            unique: 'UK01'
        },
    }, {

        underscored: true,
        underscoredAll: true
    });

    return problems_tags;
};