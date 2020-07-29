const mysql = require('mysql');
const util = require('util');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'global',
});
connection.query = util.promisify(connection.query);
const connection_server = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'server',
});
connection_server.query = util.promisify(connection.query);

module.exports = {
  mysql,
  connection,
  connection_server,
};
