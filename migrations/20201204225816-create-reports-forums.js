'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('reports_forums', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id',
                    onDelete: 'CASCADE'
                },
                allowNull: false
            },
            forum_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'forums',
                    key: 'id',
                    onDelete: 'CASCADE'
                },
                allowNull: false
            },
            reason: {
                type: Sequelize.TEXT
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
        await queryInterface.dropTable('reports_forums');
    }
};