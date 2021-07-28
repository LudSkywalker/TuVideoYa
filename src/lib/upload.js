const pool = require("../database");
module.exports = async function (req, table) {
  let datos = {};
  if (table == "cargos") {
    datos = {
      carNombre: req.body.nombre,
      carImg: req.file.filename,
      carPrecio: req.body.precio,
      carCalificacion: -1.0,
      tipoCargo_tcarId: req.body.tipo,
      proveedor_proId: req.body.pro,
    };
  } else {
    datos = {
      herNombre: req.body.nombre,
      herImg: req.file.filename,
      herPrecio: req.body.precio,
      herCalificacion: -1.0,
      tipoHerramienta_therId: req.body.tipo,
      proveedor_proId: req.body.pro,
    };
  }
  const up = await pool.query("INSERT INTO " + table + " SET ?", [datos]);
  if (up.insertId) {
    return true;
  } else {
    return false;
  }
};
