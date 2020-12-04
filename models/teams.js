'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class teams extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    teams.init({
        name: DataTypes.STRING,
        total_submissions: DataTypes.INTEGER,
        accepted_submissions: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'teams',
    });
    return teams;
};