'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('contests_teams', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            contest_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'contests',
                    key: 'id'
                },
                allowNull: false
            },
            team_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'teams',
                    key: 'id'
                },
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('contests_teams');
    }
};