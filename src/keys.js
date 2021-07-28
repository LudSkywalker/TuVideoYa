//llaves y pins de la app
if(process.env.NODE_ENV==='dev'){
    require('dotenv').config()
}
module.exports = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_DB || 'bpmmi5qwcmabqrizkvw',
    }
};