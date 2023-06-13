'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('institutions', {
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
        country: {
            allowNull: false,
            type: Sequelize.STRING
        },
        telephone: {
          allowNull: true,
          type: Sequelize.STRING
        },
        address: {
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
          type: Sequelize.INTEGER
        },
        short_name: {
          allowNull: true,
          type: Sequelize.STRING
        },
        private: {
          allowNull: false,
          type: Sequelize.INTEGER
        }
    });
},
down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('institutions');
}
};
