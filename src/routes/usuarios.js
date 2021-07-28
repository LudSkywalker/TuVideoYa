const express = require("express");
const router = express.Router();
const pool = require("../database");
const passport = require("passport");
const { ingresado } = require("../lib/redirect");
const upload = require("../lib/upload");

router.get("/salir", ingresado, (req, res) => {
	req.logout();
	res.redirect("/home");
});

router.get("/muro", ingresado, (req, res) => {
	res.render("usuarios/muro");
});

router.get("/perfil", ingresado, async (req, res) => {
	const clientes = await pool.query(
		"SELECT cliId, cliNombre, cliApellido , cliCelular, cliToken FROM cliente WHERE usuario_usuId = ? ",
		[req.user.usuId]
	);
	const cliente = clientes[0];
	res.render("usuarios/perfil", { cliente });
});

router.get("/perfil/registro", ingresado, async (req, res) => {
	const clientes = await pool.query(
		"SELECT cliId, cliNombre, cliApellido , cliCelular, cliToken FROM cliente WHERE usuario_usuId = ? ",
		[req.user.usuId]
	);
	const cliente = clientes[0];
	if (cliente) {
		res.redirect("/");
	} else {
		var redirigir = req.headers.referer;
		res.render("usuarios/rePer", { redirigir });
	}
});

router.post("/perfil/registro", ingresado, async (req, res) => {
	const clientes = await pool.query(
		"SELECT cliId, cliNombre, cliApellido , cliCelular, cliToken FROM cliente WHERE usuario_usuId = ? ",
		[req.user.usuId]
	);
	const cliente = clientes[0];
	if (cliente) {
		res.redirect("/");
	} else {
		const datos = {
			cliNombre: req.body.nombre,
			cliApellido: req.body.apellido,
			cliCelular: req.body.telefono,
			usuario_usuId: req.user.usuId,
		};
		const nuevoCliente = await pool.query("INSERT INTO cliente SET ?", [
			datos,
		]);
		if (nuevoCliente.insertId) {
			req.flash(
				"mensaje",
				"Has completado todos tus datos satisfactoriamente"
			);
		} else {
			req.flash(
				"error",
				"Ha sucedio un error, por favor intentalo mas tarde"
			);
		}
		res.redirect(req.body.redirigir);
	}
});

router.get("/registro/empresa", ingresado, (req, res) => {
	var simple = true;
	res.render("usuarios/reEmp", { simple });
});

router.get("/registro/freelancer", ingresado, (req, res) => {
	var simple = true;
	res.render("usuarios/rePro", { simple });
});

router.post("/control/personal", ingresado, async (req, res) => {
	var carga = upload(req, "cargos");
	if (carga) {
		req.flash("mensaje", "Material subido satisfactoriamente");
	} else {
		req.flash(
			"error",
			"Hubo un error al cargar el material, intentelo despues"
		);
	}
	res.redirect(req.headers.referer);
});

router.post("/control/herramienta", ingresado, async (req, res) => {
	var carga = upload(req, "herramientas");
	if (carga) {
		req.flash("mensaje", "Material subido satisfactoriamente");
	} else {
		req.flash(
			"error",
			"Hubo un error al cargar el material, intentelo despues"
		);
	}
	res.redirect(req.headers.referer);
});

router.get("/control/freelancer", ingresado, async (req, res) => {
	const simple = true;
	const free = await pool.query(
		"SELECT perId , perNombre FROM persona WHERE usuario_usuId = ? ",
		[req.user.usuId]
	);
	const tipoH = await pool.query(
		"SELECT therNombre, therId FROM tipoHerramienta"
	);
	const tipoC = await pool.query("SELECT tcarNombre, tcarId FROM tipoCargo");
	const tipos = { tipoH, tipoC };
	const pro = {
		proId: req.user.proFreeId,
		proFecha: req.user.proFreeFecha,
		proActivo: req.user.proFreeActivo,
		proNombre: free[0].perNombre,
		proRelId: free[0].perId,
		proEmp: false,
	};
	var matCargo = await pool.query(
		"SELECT carId,carNombre,carImg,carPrecio,carCalificacion FROM cargos WHERE proveedor_proId = ? ",
		[pro.proId]
	);
	var matHerra = await pool.query(
		"SELECT herId,herNombre,herImg,herPrecio,herCalificacion FROM herramientas WHERE proveedor_proId = ? ",
		[pro.proId]
	);
	var prendientes = await pool.query(
		`SELECT * FROM proveedores WHERE proveedor_proid=${pro.proId} OR proveedor_proid1=${pro.proId} OR proveedor_proid2=${pro.proId} OR proveedor_proid3=${pro.proId}`
	);
	var material = { matCargo, matHerra };
	res.render("control/control", { simple, pro, tipos, material });
});

router.get("/control/empresa", ingresado, async (req, res) => {
	const simple = true;
	const emp = await pool.query(
		"SELECT empId , empMarca FROM empresa WHERE usuario_usuId = ? ",
		[req.user.usuId]
	);
	const tipoH = await pool.query(
		"SELECT therNombre, therId FROM tipoHerramienta"
	);
	const tipoC = await pool.query("SELECT tcarNombre, tcarId FROM tipoCargo");
	const tipos = { tipoH, tipoC };
	const pro = {
		proId: req.user.proEmpId,
		proFecha: req.user.proEmpFecha,
		proActivo: req.user.proEmpActivo,
		proNombre: emp[0].empMarca,
		proRelId: emp[0].empId,
		proEmp: true,
	};
	var matCargo = await pool.query(
		"SELECT carId,carNombre,carImg,carPrecio,carCalificacion FROM cargos WHERE proveedor_proId = ? ",
		[pro.proId]
	);
	var matHerra = await pool.query(
		"SELECT herId,herNombre,herImg,herPrecio,herCalificacion FROM herramientas WHERE proveedor_proId = ? ",
		[pro.proId]
	);
	var material = { matCargo, matHerra };
	res.render("control/control", { simple, pro, tipos, material });
});

router.post(
	"/registro/empresa",
	ingresado,
	passport.authenticate("empresa", {
		successRedirect: "/muro",
		failureRedirect: "/registro/empresa",
		failureFlash: true,
		successFlash: true,
	})
);

router.post(
	"/registro/freelancer",
	ingresado,
	passport.authenticate("freelancer", {
		successRedirect: "/muro",
		failureRedirect: "/registro/freelancer",
		failureFlash: true,
		successFlash: true,
	})
);

module.exports = router;
