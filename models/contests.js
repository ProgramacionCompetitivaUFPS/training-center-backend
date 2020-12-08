'use strict';
module.exports = (sequelize, DataTypes) => {

    var Contests = sequelize.define('contests', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        title: {
            allowNull: true,
            type: DataTypes.STRING
        },
        description: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        init_date: {
            allowNull: false,
            type: DataTypes.DATE
        },
        end_date: {
            allowNull: false,
            type: DataTypes.DATE
        },
        rules: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        public: {
            allowNull: false,
            type: DataTypes.BOOLEAN
        },
        key: {
            allowNull: true,
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: 3,
                    msg: "Debe proporcionar una contraseña válida."
                }
            }
        },
        type: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        underscored: true,
        underscoredAll: true
    });

    Contests.associate = function(models) {
        Contests.belongsTo(models.users)

        Contests.belongsToMany(models.problems, {
            through: 'contests_problems',
            as: 'problems',
            onDelete: 'CASCADE'
        })

        Contests.belongsToMany(models.users, {
            through: 'contests_students',
            as: 'users',
            onDelete: 'CASCADE'
        })

        Contests.belongsToMany(models.teams, {
            through: 'contests_teams',
            as: 'teams',
            onDelete: 'CASCADE'
        })
    }

    return Contests;
};