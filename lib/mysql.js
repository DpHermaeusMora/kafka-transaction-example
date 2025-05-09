const mysql = require('mysql2/promise')

const videoPool = mysql.createPool({
    database: 'video',
    host: 'localhost',
    port: '3306',
    user: 'mysql',
    password: '1324'
})

const billPool = mysql.createPool({
    database: 'bill',
    host: 'localhost',
    port: '3306',
    user: 'mysql',
    password: '1324'
})

module.exports = {
    videoPool,
    billPool
}