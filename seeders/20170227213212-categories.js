'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('blacklist_tokens', null, {});
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('categories', null, {});
    }
};