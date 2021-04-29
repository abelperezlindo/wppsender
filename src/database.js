
const mysql = require('mysql');
const { promisify } = require('util');


const database = {
    host: '127.0.0.1',  //For local dev
    port: '49159',
    user: 'db',
    password: 'db',
    database: 'db',
    multipleStatements: true
};

const pool = mysql.createConnection(database);

pool.connect(function (err) {
  if (err) {
    console.error(err);
    return;
  } else {
    console.log('db is connected');
  }
});

pool.query = promisify(pool.query); // Use promises in queries for mysql

module.exports = pool;