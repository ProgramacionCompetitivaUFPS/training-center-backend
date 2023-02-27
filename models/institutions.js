'use strict';

/**
 * Instance a material model
 * @param {any} sequelize
 * @param {any} DataTypes
 * @returns
 */

module.exports = (sequelize, DataTypes) => {
    var Institutions = sequelize.define('institutions', {
        id: {
            allowNull: false,
            autoIncrement: false,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        country: {
            allowNull: false,
            type: DataTypes.STRING
        },
        telephone: {
            allowNull: true,
            type: DataTypes.STRING
        },
        address: {
            allowNull: true,
            type: DataTypes.STRING
        },
        private: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        type: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        shortName: {
            allowNull: true,
            type: DataTypes.STRING
        }
    }, {
        underscored: true,
        underscoredAll: true
    });

    Institutions.associate = (models) => {
        Institutions.hasMany(models.users, {
            as: 'users'
        })

    }

    return Institutions;
};