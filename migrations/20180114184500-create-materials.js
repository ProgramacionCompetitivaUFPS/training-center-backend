'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('materials', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING
            },
            category_id: {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: 'categories',
                    key: 'id'
                }
            },
            user_id: {
                allowNull: true,
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            description: {
                allowNull: false,
                type: Sequelize.STRING
            },
            url: {
                allowNull: false,
                type: Sequelize.STRING
            },
            status: {
                allowNull: false,
                type: Sequelize.BOOLEAN
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            type: {
                allowNull: true,
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            body: {
                allowNull: true,
                type: Sequelize.TEXT
            },
            level: {
                allowNull: true,
                type: Sequelize.STRING,
            },
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('materials');
    }
};