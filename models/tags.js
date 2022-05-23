'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    var tags = sequelize.define('tags', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        description: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        material_id: {
            allowNull: true,
            type: DataTypes.INTEGER,
            references: {
                model: 'materials',
                key: 'id'
            }
        }
    }, {
        underscored: true,
        underscoredAll: true
    });

    tags.associate = function(models) {
        tags.belongsTo(models.materials, {
            foreignKey: {
                allowNull: true
            }
        })
    }
    return tags;
};