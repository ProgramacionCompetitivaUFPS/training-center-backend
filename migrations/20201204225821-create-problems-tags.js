'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('problems_tags', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            problem_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'problems',
                    key: 'id',
                    onDelete: 'CASCADE'
                },
                allowNull: false
            },
            tag_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'tags',
                    key: 'id',
                    onDelete: 'CASCADE'
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
        await queryInterface.dropTable('problems_tags');
    }
};