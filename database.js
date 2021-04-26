
const mysql = require('mysql');
const { promisify } = require('util');


const database = {
    host: 'localhost',  //For local dev
    //port: '49153',
    user: 'admin',
    password: 'admin',
    database: 'wppsender',
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