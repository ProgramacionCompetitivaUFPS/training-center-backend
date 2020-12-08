'use strict';

module.exports = {
    /**
     * Creates Users Table
     * @param {any} queryInterface
     * @param {any} Sequelize
     * @returns
     */
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('users', {
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
            email: {
                allowNull: false,
                type: Sequelize.STRING,
                unique: true
            },
            password: {
                allowNull: false,
                type: Sequelize.STRING
            },
            code: {
                type: Sequelize.STRING
            },
            type: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            username: {
                allowNull: false,
                type: Sequelize.STRING,
                unique: true
            },
            socket_id: {
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
            education_level: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            institution: {
                type: Sequelize.STRING,
                allowNull: true
            },
            profile_image_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status_learning: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
        });

    },

    /**
     * Deletes Users Table
     * @param {any} queryInterface
     * @param {any} Sequelize
     * @returns
     */
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('users');
    }
};