'use strict';

const moment = require('moment')

/**
 * Users Seeder
 */

module.exports = {

    /**
     * Insert users into Users Table
     * @param {any} queryInterface
     * @param {any} Sequelize
     * @returns
     */
    up: function(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('users', [{
            id: 1,
            name: 'Admin',
            email: 'admin@gmail.com',
            //password: 12345
            password: '$2a$10$/OM4Ay1D6RzRvpTBV3MfbeNP/2ZMlMzsIctEde8OKWAPRtxhUjkRC',
            code: 0,
            type: 2,
            username: 'admin',
            institution_id: 1,
            created_at: new Date(),
            updated_at: new Date()
        }])
    },

    /**
     * Delete all the data in Users Table
     * @param {any} queryInterface
     * @param {any} Sequelize
     * @returns
     */
    down: function(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('users', null, {});
    }
};