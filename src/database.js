const mysql         = require('mysql');
const { promisify } = require('util');
const { database }  = require('../config');

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