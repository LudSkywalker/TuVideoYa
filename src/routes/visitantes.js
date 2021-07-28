const express = require("express");
const router = express.Router();
const pool = require("../database");
const passport = require("passport");
const { visitante } = require("../lib/redirect");

router.get("/", visitante, async (req, res) => {
	res.redirect("/home");
});

router.get("/video/:id", async (req, res) => {
	const { id } = req.params;
	const vidId = {
		vidId: id,
	};
	const videos = await pool.query(
		"SELECT vidId , vidLink , vidNombre , vidDescripcion , vidPrecio, proveedores_prosId FROM video WHERE ?",
		[vidId]
	);
	var video = videos[0];
	var url = "";
	let separado = video.vidLink.split("watch?v=");
	url = separado[0] + "embed/" + separado[1];
	video.vidLink = url;
	const proveedores = video.proveedores_prosId;
	var usuario = null;
	if (req.user) {
		var usuario = req.user.usuId;
	}
	var chat = null;
	if (usuario) {
		chat = await pool.query(
			"SELECT c.chatMensaje, c.chatPregunta FROM chat c INNER JOIN cliente cl ON  c.cliente_cliId = cl.cliId AND cl.usuario_usuId= ? WHERE c.proveedores_prosId = ? ",
			[usuario, proveedores]
		);
	}
	res.render("visitantes/videos", { video, chat });
});

router.post("/chat", async (req, res) => {
	const vidId = req.body.vidId.split(" ")[1];
	if (req.user) {
		const usuario = req.user.usuId;
		const clientes = await pool.query(
			"SELECT cliId FROM cliente WHERE usuario_usuId= ? ",
			[usuario]
		);
		if (!clientes[0].cliId) {
			req.flash(
				"error",
				"Para enviar el mensaje debes terminar de llenar los datos de tu perfil"
			);
		} else {
			const chat = {
				chatMensaje: req.body.mensaje,
				cliente_cliId: clientes[0].cliId,
				proveedores_prosId: req.body.proos,
			};
			await pool.query("INSERT chat SET ?", [chat]);
			req.flash("mensaje", "Enviado Satisfactoriamente");
		}
	} else {
		req.flash(
			"error",
			"Debes iniciar sesion primero para poder aceder al servicio de chats"
		);
	}
	res.redirect("/video/" + vidId);
});

router.get("/home", async (req, res) => {
	var videos = await pool.query(
		"SELECT vidId , vidLink , vidNombre , vidDescripcion  FROM video LIMIT 5"
	);
	for (video of videos) {
		var url = "";
		let separado = video.vidLink.split("watch?v=");
		url = separado[0] + "embed/" + separado[1];
		video.vidLink = url;
	}
	const tipoVideo = await pool.query(
		"SELECT tvidId , tvidNombre FROM tipoVideo LIMIT 4"
	);
	res.render("visitantes/home", { videos, tipoVideo });
});

router.get("/registro", visitante, (req, res) => {
	var simple = true;
	res.render("visitantes/registro", { simple });
});

router.get("/ingresar", visitante, (req, res) => {
	var simple = true;
	res.render("visitantes/login", { simple });
});

router.post(
	"/ingresar",
	visitante,
	passport.authenticate("ingresar", {
		successRedirect: "/muro",
		failureRedirect: "/ingresar",
		failureFlash: true,
		successFlash: true,
	})
);

router.post(
	"/registro",
	visitante,
	passport.authenticate("registro", {
		successRedirect: "/muro",
		failureRedirect: "/registro",
		failureFlash: true,
		successFlash: true,
	})
);

router.post("/enviar", async (req, res) => {
	if (req.body.reco) {
		var query = " '%" + req.body.reco + "%' ";
		const usu = await pool.query(
			"SELECT usuNombre FROM usuario WHERE usuNombre LIKE " +
				query +
				" LIMIT 5"
		);
		res.json(usu);
	} else {
		const usu = {};
		res.json(usu);
	}
});

router.get("/empresas", async (req, res) => {
	var emp = await pool.query("SELECT * FROM empresa WHERE empEstado=1");
	for (let i = 0; i < emp.length; i++) {
		let usuid = { usuId: emp[i].usuario_usuId };
		const us = await pool.query(
			"SELECT usuNombre FROM usuario WHERE usuEstado=1 AND ?",
			[usuid]
		);
		emp[i].usu = us[0].usuNombre;
	}
	res.render("datos/emp", { emp });
});

router.get("/profesionales", async (req, res) => {
	var pro = await pool.query("SELECT * FROM persona WHERE perEstado=1");
	for (let i = 0; i < pro.length; i++) {
		let usuid = { usuId: pro[i].usuario_usuId };
		const us = await pool.query(
			"SELECT usuNombre FROM usuario WHERE usuEstado=1 AND ?",
			[usuid]
		);
		pro[i].usu = us[0].usuNombre;
	}
	res.render("datos/pro", { pro });
});

router.get("/prueba", async (req, res) => {
	//var devi = await pool.query("SELECT * FROM empresa");
	// var devi = await pool.query("SELECT * FROM usuario");
	//   var devi = await pool.query("Describe empresa");
	//  var devi = await pool.query("Delete FROM usuario");
	//  var devi = await pool.query("Delete FROM empresa");
	// console.log(devi);
	//await pool.query("INSERT INTO tipoHerramienta (therNombre) VALUES ('computador')");
	//var prueba = await pool.query("SELECT * FROM tipoHerramienta ");
	//  const usu = await pool.query("SELECT * FROM usuario WHERE usuEstado=1");
	//  res.render("visitantes/home", { usu });
	/* await pool.query("Delete FROM empresa");
  await pool.query("Delete FROM persona")
  await pool.query("Delete FROM proveedor"); */
	//var emp = await pool.query("SELECT * from sessions");
	/* var free = await pool.query("SELECT * FROM persona");
  var emp = await pool.query("SELECT * FROM empresa");
  var proo = await pool.query("SELECT * FROM proveedor");
  var prueba = { emp, free,proo };
  */
	/*  await pool.query("DELETE FROM cargos");
 await pool.query("DELETE FROM herramientas");
 var prueba1 = await pool.query("SELECT * FROM herramientas"); 
 var prueba2 = await pool.query("SELECT * FROM cargos"); 
 var prueba={prueba1,prueba2}; */
	/*    await pool.query("INSERT INTO video (vidLink , vidNombre , vidDescripcion , vidPrecio , cliente_cliId , proveedores_prosId , tipoVideo_tvidId) VALUES ('https://www.youtube.com/watch?v=ICPzZW9drDw','Ingenieria de la escritura GUIONES LIBRETOS HISTORIAS Sesión 4','Video bonito sobre como funcionan los libretos', 20000, 1 ,3 ,1)");*/
	var prueba = await pool.query("SELECT * FROM video");
	//await pool.query("INSERT INTO proveedores (proveedor_proId,proveedor_proId1) VALUES (3,1)");
	var proo = 4;
	prueba.push(
		await pool.query(
			`SELECT * FROM proveedores WHERE proveedor_proid=${proo} OR proveedor_proid1=${proo} OR proveedor_proid2=${proo} OR proveedor_proid3=${proo}`
		)
	);

	res.send(prueba);
});

module.exports = router;
