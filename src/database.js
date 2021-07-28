//Requerimientos conexion mysql
const mysql = require("mysql");
const { promisify } = require("util");
const { database } = require("./keys");

//Inicializacion
const pool = mysql.createPool(database);

//Connexion y errores
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database disconected");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has to many connection");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was wrong");
    }
    console.error(err);
  }
  if (connection) {
    connection.release();
    console.log("Database is connected");
  }
  return;
});
//De callback a promesas js
pool.query = promisify(pool.query);

// exportar base de datos
module.exports = pool;
