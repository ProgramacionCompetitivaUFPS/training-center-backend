const env = require('node-env-file')
env('.env')

module.exports = {
    development: {        
        url: process.env.DATABASE_URL,
        dialect: 'mysql'
    },
    production: {
        url: process.env.DATABASE_URL,
        dialect: 'mysql',
    },
    test: {
        url: '',
        dialect: "mysql"
    },
    SECRET_TOKEN: process.env.SECRET_TOKEN
};
