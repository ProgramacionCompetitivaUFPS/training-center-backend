const env = require('node-env-file')
env('.env')

module.exports = {
    development: {
        url: process.env.DATABASE_URL,
        dialect: 'mysql',
        logging: false
    },
    production: {
        url: process.env.DATABASE_URL,
        dialect: 'mysql',
        logging: false
    },
    test: {
        url: '',
        dialect: "mysql",
        logging: false
    },
    SECRET_TOKEN: process.env.SECRET_TOKEN,

};