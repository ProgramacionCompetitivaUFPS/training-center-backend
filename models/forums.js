'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    var forums = sequelize.define('forums', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        root_id_forum: {
            allowNull: false,
            type: DataTypes.INTEGER,
            references: {
                model: 'forums',
                key: 'id'
            }
        },
        description: {
            allowNull: false,
            type: DataTypes.TEXT
        },
        is_closed: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        status_view: {
            allowNull: true,
            type: DataTypes.INTEGER
        }
    });

    forums.associate = function(models) {

        forums.belongsTo(models.users)
        forums.hasOne(forums, { as: 'forums', foreignKey: 'id' })

    }

    return forums;
};