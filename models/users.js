'use strict';

const bcrypt = require("bcrypt-nodejs");

/**
 * Users Model
 */

/**
 * Instance a user model
 * @param {any} sequelize
 * @param {any} DataTypes
 * @returns
 */
module.exports = function(sequelize, DataTypes) {

    var Users = sequelize.define('users', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: 3,
                    msg: "El campo nombre no puede ser vacio."
                }
            }
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                len: {
                    args: [6, 128],
                    msg: "El email debe tener entre 6 y 128 caracteres."
                },
                isEmail: {
                    msg: "Debe proporcionar un email válido."
                }
            }
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: 3,
                    msg: "Debe proporcionar una contraseña válida."
                }
            }
        },
        confirm_password: {
            type: DataTypes.VIRTUAL
        },
        code: {
            type: DataTypes.STRING
        },
        type: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        username: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                len: {
                    args: [6, 30],
                    msg: "El nombre de usuario debe tener entre 6 y 30 caracteres."
                }
            }
        },
        socket_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        education_level: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        // institution: {
        //     type: DataTypes.STRING,
        //     allowNull: true
        // },
        profile_image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status_learning: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        institution_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'institutions',
                key: 'id'
            }
        }
    }, {
        hooks: {
            beforeCreate: hashPassword,
            beforeUpdate: hashPassword
        },
        underscored: true,
        underscoredAll: true,
    });
    //Class methods
    Users.associate = (models) => {
        Users.hasMany(models.problems, { as: 'problems' })

        Users.hasMany(models.materials, { as: 'materials' })

        Users.hasMany(models.submissions, { as: 'submissions' })

        Users.belongsTo(models.institutions, {
            foreignKey: {
                allowNull: true,
            }
        })

        Users.belongsToMany(models.syllabuses, {
            through: 'syllabus_students',
            as: 'syllabuses'
        })

        Users.belongsToMany(models.contests, {
            through: 'contests_students',
            as: 'contests',
            onDelete: 'CASCADE'
        })
    }

    // Instance methods

    /**
     * Hide passwords from queries
     * @returns
     */
    Users.prototype.toJSON = function() {
        var values = Object.assign({}, this.get());
        delete values.password;
        return values;
    };

    /**
     * Verify the password on login
     * @param {any} value
     * @returns
     */
    Users.prototype.authenticate = function(value) {
        if (bcrypt.compareSync(value, this.password))
            return this;
        else
            return false;
    };

    return Users;
};


/**
 * Validates and encrypts the given password
 * @param {any} user
 * @param {any} options
 * @param {any} callback
 * @returns
 */
var hashPassword = function(user, options, callback) {
    user.email = user.email.toLowerCase()

    if (!user.changed('password')) return callback()

    if (user.password != user.confirm_password) {
        throw new Error("Las contraseñas no coinciden");
    }

    bcrypt.hash(user.get('password'), bcrypt.genSaltSync(10), null, (err, hash) => {
        if (err) return callback(err);
        user.set('password', hash);
        return callback(null, options);
    })
}