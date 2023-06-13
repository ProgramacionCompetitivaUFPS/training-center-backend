'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('contests', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING
            },
            description: {
                allowNull: true,
                type: Sequelize.TEXT
            },
            init_date: {
                allowNull: false,
                type: Sequelize.DATE
            },
            end_date: {
                allowNull: false,
                type: Sequelize.DATE
            },
            rules: {
                allowNull: true,
                type: Sequelize.TEXT
            },
            user_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            public: {
                allowNull: false,
                type: Sequelize.BOOLEAN
            },
            key: {
                allowNull: true,
                type: Sequelize.STRING
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
                allowNull: false,
                type: Sequelize.INTEGER,
                defaultValue: 0
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('contests');
    }
};