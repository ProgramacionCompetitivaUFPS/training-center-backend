'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('forums', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            root_id_forum: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'forums',
                    key: 'id'
                }
            },
            description: {
                allowNull: false,
                type: Sequelize.TEXT
            },
            is_closed: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            status_view: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('forums');
    }
};