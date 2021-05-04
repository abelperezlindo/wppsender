const mysql         = require('mysql');
const { promisify } = require('util');
const config  = require('../config.js');
const pool = mysql.createConnection(config.database);

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
