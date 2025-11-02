const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  port: 3307,
  user: "posta-db-username",
  password: "posta-db-password",
  database: "posta-db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
