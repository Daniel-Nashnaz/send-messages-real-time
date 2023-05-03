require('dotenv').config();
const config = {
    user: process.env.user,
    password: process.env.password,
    server: '127.0.0.1',
    database: 'DrivingControl',
    options: {
        encrypt: false,
        trustedconnection: true,
        enableArithAbort: true,
        instancename: 'SQLEXPRESS'
    },
    port: 1433
}

module.exports = config;
