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
            email: 'programacioncompetitivaufps@gmail.com',
            password: '$2a$10$6LbPFQDH6/.N.Z4QBs/9puHZgRGfFOZppEa8pqNT9KOK0SiLfNSA.',
            type: 2,
            username: 'admin',
            institution_id: 1,
            created_at: new Date(),
            updated_at: new Date()
        },{
            id: 2,
            name: 'Admin2',
            email: 'genesisdanielavjau@ufps.edu.co',
            password: '$2a$10$gkCO2e51GUC69Y6NQ.MovuWPF3yqxLh/70SLGKa2CXi2uUaL4r.y.',
            type: 2,
            username: 'admin2',
            institution_id: 1,
            created_at: new Date(),
            updated_at: new Date()
        }], {});
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