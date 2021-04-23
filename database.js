
const mysql = require('mysql');

const database = {
    host: '127.0.0.1',
    port: '49153',
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


module.exports = pool;