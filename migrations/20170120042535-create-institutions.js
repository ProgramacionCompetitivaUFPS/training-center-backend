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
        create_at: {
            allowNull: false,
            type: Sequelize.DATE
        },
        update_at: {
            allowNull: false,
            type: Sequelize.DATE
        },
        institution: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        type: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        short_name: {
          allowNull: true,
          type: Sequelize.STRING
        }
    });
},
down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('institutions');
}
};
