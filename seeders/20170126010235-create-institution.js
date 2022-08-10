"use strict";

module.exports = {
  /**
   * Insert users into Users Table
   * @param {any} queryInterface
   * @param {any} Sequelize
   * @returns
   */
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "institutions",
      [
        {
          id: 1,
          name: "Universidad Francisco de Paula Santander",
          country: "colombia",
          institution: 0,
          type: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  /**
   * Delete all the data in Users Table
   * @param {any} queryInterface
   * @param {any} Sequelize
   * @returns
   */
  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete("institutions", null, {});
  },
};
