const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const pool = require("../database");
const helpers = require("./helpers");

passport.use(
  "registro",
  new localStrategy(
    {
      usernameField: "nombre",
      passwordField: "passw",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      const usu = {
        usuNombre: username,
        usuEmail: req.body.email,
        usuPassword: await helpers.encriptar(password),
      };
      const email = { usuEmail: usu.usuEmail };
      const estado = { usuEstado: 1 };
      const passw = { usuPassword: usu.usuPassword };
      const query = meto(password, usu.usuPassword);
      const old = await pool.query(query, [email, estado, passw]);
      if (!old[0]) {
        const nuevo = await pool.query("INSERT INTO usuario SET ?", [usu]);
        usu.usuId = nuevo.insertId;
        return done(
          null,
          usu,
          req.flash(
            "mensaje",
            "Hola " + usu.usuNombre + ", te has registrado exitosamente"
          )
        );
      } else {
        return done(
          null,
          false,
          req.flash("error", "Este usuario ya fue registrado")
        );
      }
    }
  )
);

passport.use(
  "ingresar",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "passw",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      const usu = {
        usuEmail: username,
        usuPassword: await helpers.encriptar(password),
      };
      const email = { usuEmail: usu.usuEmail };
      const estado = { usuEstado: 1 };
      const passw = { usuPassword: usu.usuPassword };
      const query = meto(password, usu.usuPassword);
      const old = await pool.query(query, [email, estado, passw]);
      if (old.length > 0) {
        const pasold = old[0];
        const comparar = await helpers.comparar(password, pasold.usuPassword);
        if (comparar) {
          usu.usuId = pasold.usuId;
          usu.usuNombre = pasold.usuNombre;
          done(
            null,
            usu,
            req.flash("mensaje", "Bienvenido de nuevo " + usu.usuNombre)
          );
        } else {
          done(null, false, req.flash("error", "La contraseña es incorrecta"));
        }
      } else {
        done(
          null,
          false,
          req.flash("error", "El usuario que has ingresado no existe")
        );
      }
    }
  )
);

passport.use(
  "empresa",
  new localStrategy(
    {
      usernameField: "marca",
      passwordField: "matricula",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      const usuId = { usuario_usuId: req.user.usuId };
      const estado = { empEstado: 1 };
      const old = await pool.query("SELECT empId FROM empresa WHERE ? AND ?", [
        usuId,
        estado,
      ]);
      console.log(req.body.direccion);
      if (!old[0]) {
        const empr = {
          empMarca: req.body.marca,
          empMatricula: req.body.matricula,
          empRepre: req.body.repre,
          empImagen: req.body.img,
          empCiudad: req.body.ciudad,
          empDireccion: req.body.direccion,
          empTelefono: req.body.telefono,
          empCorreo: req.body.email,
          empPagina: req.body.web,
          usuario_usuId: usuId.usuario_usuId,
        };
        const pros = {
          proEmp: 1,
          usuario_usuId: usuId.usuario_usuId,
        };
        await pool.query("INSERT INTO empresa SET ?", [empr]);
        await pool.query("INSERT INTO proveedor SET ?", [pros]);
        var usu = {
          usuId: usuId.usuario_usuId,
        };
        return done(
          null,
          usu,
          req.flash("mensaje", "Empresa registrada correctamente")
        );
      } else {
        return done(
          null,
          false,
          req.flash("error", "Solo puede tener una empresa registrada")
        );
      }
    }
  )
);

passport.use(
  "freelancer",
  new localStrategy(
    {
      usernameField: "nombre",
      passwordField: "email",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      const usuId = { usuario_usuId: req.user.usuId };
      const estado = { perEstado: 1 };
      const old = await pool.query("SELECT perId FROM persona WHERE ? AND ?", [
        usuId,
        estado,
      ]);
      if (!old[0]) {
        const empr = {
          perNombre: req.body.nombre,
          perEmail: req.body.email,
          perRut: 0,
          perFoto: req.body.img,
          perDireccion: req.body.direccion,
          perCiudad: req.body.ciudad,
          perTelefono: req.body.telefono,
          perPagina: req.body.web,
          usuario_usuId: usuId.usuario_usuId,
        };
        const pros = {
          proEmp: 0,
          usuario_usuId: usuId.usuario_usuId,
        };
        const free = await pool.query("INSERT INTO persona SET ?", [empr]);
        const proo = await pool.query("INSERT INTO proveedor SET ?", [pros]);
        var usu = {
          usuId: usuId.usuario_usuId,
        };
        return done(
          null,
          usu,
          req.flash("mensaje", "Freelancer registrado correctamente")
        );
      } else {
        return done(
          null,
          false,
          req.flash("error", "Solo puedes registrar un freelancer")
        );
      }
    }
  )
);

passport.serializeUser((usu, done) => {
  done(null, usu.usuId);
});

passport.deserializeUser(async (id, done) => {
  var usu={ usuId : id };
  let query =
    "SELECT usu.usuId , usu.usuNombre , usu.usuEmail , pro.proId, pro.proEmp, pro.proActivo, pro.proFecha FROM usuario usu LEFT JOIN proveedor pro ON usu.usuEstado =  1 AND pro.proEstado = 1 AND pro.usuario_usuId = ? WHERE usu.usuId = ? ";
  var usuarios = await pool.query(query, [id,id]);
  usu.usuNombre=usuarios[0].usuNombre;
  usu.usuEmail=usuarios[0].usuEmail;
  if (usuarios[1]) {
    if (usuarios[0].proEmp) {
      usu.proEmpId = usuarios[0].proId;
      usu.proEmpActivo = usuarios[0].proActivo;
      usu.proEmpFecha = usuarios[0].proFecha;
      usu.proFreeId = usuarios[1].proId;
      usu.proFreeActivo = usuarios[1].proActivo;
      usu.proFreeFecha = usuarios[1].proFecha;
    } else {
      usu.proFreeId = usuarios[0].proId;
      usu.proFreeActivo = usuarios[0].proActivo;
      usu.proFreeFecha = usuarios[0].proFecha;
      usu.proEmpId = usuarios[1].proId
      usu.proEmpActivo = usuarios[1].proActivo;
      usu.proEmpFecha = usuarios[1].proFecha;
    }
  }else{
    if (usuarios[0].proEmp) {
      usu.proEmpId = usuarios[0].proId
      usu.proEmpActivo = usuarios[0].proActivo;
      usu.proEmpFecha = usuarios[0].proFecha;
    } else {
      usu.proFreeId = usuarios[0].proId;
      usu.proFreeActivo = usuarios[0].proActivo;
      usu.proFreeFecha = usuarios[0].proFecha;
    }
  };
  done(null, usu);
});

function meto(pas, pass) {
  if (pas === pass) {
    var query = "SELECT * FROM usuario WHERE ? AND ? AND ?";
    return query;
  } else {
    var query = "SELECT * FROM usuario WHERE ? AND ?";
    return query;
  }
};
