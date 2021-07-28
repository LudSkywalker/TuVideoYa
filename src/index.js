//Requerimientos nodejs
const express = require("express");
const exphbs = require("express-handlebars");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const mysqlstore = require("express-mysql-session");
const flash = require("connect-flash");
const { database } = require("./keys");
const multer = require("multer");
require("./lib/passport");
//Inicializacion
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/upload"));
  },
  filename: (req, file, cb) => {
    var time=new Date().getTime();
    req.nametime=time;
    cb(null, time+path.extname((file.originalname)));
  },
});
const app = express();

app.set("port", process.env.PORT || 4000); //puerto del host
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    helpers: require("./lib/handlebars"),
  })
);
app.set("view engine", ".hbs");

//midlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secreto",
    store: mysqlstore(database),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(
  multer({
    storage: storage,
  }).single("file")
);
//global variants
app.use((req, res, next) => {
  app.locals.mensaje = req.flash("mensaje");
  app.locals.error = req.flash("error");
  app.locals.usu = req.user;
  next();
});
//rutas
app.use(require("./routes/usuarios"));
app.use(require("./routes/visitantes"));
//public
app.use(express.static(path.join(__dirname,"public")));
//Puertos
app.listen(app.get("port"), () => {
  console.log("Sever on port", app.get("port"));
});
