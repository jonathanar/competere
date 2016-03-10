express = require('express');
jwt = require('jwt-simple');
http = require('http');
moment = require('moment');
mysql = require('mysql');
path = require('path');
fs = require('fs');

newTok = '';
whoIs = '';
route = '';
whoIsName = '';

app = express();
app.set('jwtTokenSecret', 'CompitereKeyForRuleThemAll');

/*db_config = {
	host: 'localhost',
	database: 'competere',
	user: 'root',
	password: ''
	
};*/


/*db_config = {
	host: '66.147.244.56',
	user: 'carosblu_jonas',
	password: 'jona123',
	database: 'carosblu_competere',
	port: 3306
};*/


db_config = {
	host: '23.229.173.41',
	user: 'competereuser',
	password: 'competerepass123',
	database: 'competere'
	/*port: 3306*/
};


var connection;

/*function handleConnection() {
	connection = mysql.createConnection(db_config);
	console.log("exec1");

	connection.connect(function(err){
		console.log("exec2");
		if(err){
			console.log('db error ', err);
			setTimeout(handleConnection, 5000);
		}
	});

	connection.on('error', function(err){
		console.log("exec3");
		if(err.code === 'PROTOCOL_CONNECTION_LOST'){
			handleConnection();
		}else{
			throw err;
		}
	})
}*/


function handleConnection() {
	connection = mysql.createConnection(db_config);
	console.log("conexion establecida");

}

/*handleConnection();*/

app.set('port', 3000);


app.use(function (req, res, next) {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, newToken, nameUser');
	res.set('Access-Control-Expose-Headers', 'Origin, X-Requested-With, Content-Type, Accept, newToken, nameUser');
	res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
	res.set('Pragma', 'no-cache'); // HTTP 1.0.
	res.set('Expires', '0'); // Proxies.
	next();
});


app.use(express.static(__dirname + '/'));
app.use('/styles', express.static(__dirname + '/css'));
app.use('/scripts', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/files', express.static(__dirname + '/resources'));
app.use(function (req, res, next){
	handleConnection();
	next();
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/*app.use(function (req, res, next){
	if(req.path == '/favicon.ico'){
		console.log("hola");
		res.end();
	}
});*/

app.use(function (req, res, next){
	newTok = '';
	whoIs = '';
	route = '';
	whoIsName = '';
	token = req.headers.authorization;
	if(req.path === '/' || req.path === '/login' || req.path === '/logview'){
		if(autenticate(token)){
			newTok = extendTime(token);
			whoAreYou(token);
			setTimeout(function(){
				res.redirect('/menu');
			},100);			
		}else{
			next();
		}
	}else{
		if(autenticate(token)){
			newTok = extendTime(token);
			whoIs = whoAreYou(newTok);
			whoAreYouName(newTok, function(name, user){
				whoIsName = name;
				whoIsId = user;
				next();
			});	
		}else{
			whoIsName = '';
			whoIsId = '';
			res.sendFile(__dirname + '/views/outlogin.html');		
		}
	}
});

//RUTAS

//Pantalla principal
app.get('/', function (req, res, next) {
	route = '/views/index.html';
	next();
});

//Pantalla de logeo
app.get('/logview', function (req, res, next) {
	route = '/views/login.html';
	next();
});

//Pantalla Acerca de
app.get('/about', function (req, res, next) {
	route = '/views/about.html';
	next();
});

//Pantalla Fuera del sistema
app.get('/outlogin', function (req, res, next) {
	route = '/views/outlogin.html';
	next();
});

app.get('/competencias', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/competencias.html';
		next();
	}
});

app.get('/profesores', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/profesores.html';
		next();
	}
});

app.get('/alumnos', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/alumnos.html';
		next();
	}
});

app.get('/materias', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/materias.html';
		next();
	}
});

app.get('/permatprofalu', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/permatprofalu.html';
		next();
	}
});

app.get('/perfexp', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/perfil_experto.html';
		next();
	}
});

app.get('/actividades', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/actividades.html';
	}
	if(whoIs == 'Titular'){
		route = '/views/actividades_ti.html';
	}
	next();
});

app.get('/evaluaciones', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/evaluaciones.html';
		next();
	}
	if(whoIs == 'Profesor'){
		route = '/views/evaluaciones_pf.html';
		next();
	}
	if(whoIs == 'Titular'){
		route = '/views/evaluaciones_ti.html';
		next();
	}
});

app.get('/reportes', function (req, res, next) {
	if(whoIs == 'Administrador'){
		route = '/views/reportes.html';
		next();
	}
});

//Pantalla Menu con autenticacion
app.get('/menu', function (req, res, next){
	if(whoIs === "Administrador"){
		route = '/views/menu_admin.html';
	}
	if(whoIs === "Titular"){
		route = '/views/menu_ti.html';
	}
	if(whoIs === "Profesor"){
		route = '/views/evaluaciones_pf.html';
	}
	if(whoIs === "Estudiante"){
		route = '/views/reportes_al.html';
	}
	next();
});

//CONTROLADORES
app.get('*', function (req, res, next){
	res.set('newToken', newTok);
	res.set('nameUser', whoIsName);
	if(route != ''){
		res.sendFile(__dirname + route);
		route = '';
	}/*else{
		next();
	}*/
	next();
});

app.get('/login', function (req, res, next) {
	usr = JSON.parse(req.query.user);
	user = usr.usuario;
	pass = usr.contrasena;
	if(user == 'L01421024' && pass == 'jonaylucy13052912'){
		data = {nombre: 'Jonathan Ayala Rodríguez', token: giveToken('L01421024', thisIsYou('Administrador'))};
	}else{
		data = {status: 'error', text: 'Usuario no registrado, verifique bien su usuario y contraseña, si el problema persiste, contacte con el administrador!'};
		connection.query('SELECT * FROM alumnos WHERE BINARY alu_matricula = ? AND BINARY alu_password = ? LIMIT 1', [user, pass], function (err, rows) {
			if(!err && rows.length == 0){
				connection.query('SELECT * FROM profesores WHERE BINARY pro_nomina = ? AND BINARY pro_password = ? LIMIT 1', [user, pass], function (err, rows) {				
					if(!err && rows.length != 0){
						data = {nombre: rows[0].pro_nombre + ' ' + rows[0].pro_apellido_paterno, token: giveToken(rows[0].pro_nomina, thisIsYou(rows[0].pro_rol))};
					}
				});
			}else{
				data = {nombre: rows[0].alu_nombre + ' ' + rows[0].alu_apellido_paterno, token: giveToken(rows[0].alu_matricula, thisIsYou('Estudiante'))};
			}
		});
	}
	fs.appendFile('log.txt', 'hola\r\n', function (err){
		if(err){
			return console.log(err);
		}
		console.log("file saved");
	});	
	setTimeout(function(){
		res.send(data);
		next();
	},1000);
});

/*   QUERY QUE OBTIENE LAS CATEGORIAS DE UN CAMPO   */
// SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING(COLUMN_TYPE, 7, LENGTH(COLUMN_TYPE) - 8), "\',\'", 1 + units.i + tens.i * 10) , "\',\'", -1) FROM INFORMATION_SCHEMA.COLUMNS CROSS JOIN (SELECT 0 AS i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) units CROSS JOIN (SELECT 0 AS i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) tens WHERE TABLE_NAME = "subcompetencias" AND COLUMN_NAME = "sco_taxonomia"

app.get('/getclaperiod', function (req, res, next){
	per = req.query.periodo;
	clm = req.query.cla_mat;
	connection.query('SELECT mpe_clave_materia_periodo FROM materia_periodo WHERE mpe_clave_periodo = ? AND mpe_clave_materia = ? LIMIT 1', [per, clm], function (err, rows){
		if(!err && rows.length != 0){
			res.send(rows[0].mpe_clave_materia_periodo.toString());
		}else{
			res.end();
		}
		next();
	});	
});

app.get('/getactivities', function (req, res, next){
	cla = req.query.clave;
	connection.query('SELECT * FROM actividades WHERE act_clave_materia_periodo = ?', [cla], function (err, rows, fields){
		if(!err && rows.length != 0){
			res.send(rows);
		}else{
			res.end();
		}
		next();
	});	
});

app.get('/updateactivity', function (req, res, next){
	cla = req.query.clave;
	nac = req.query.nombre;
	trans = req.query.type_trans;
	alumnos = [];
	if(trans == "true"){
		connection.query('SELECT * FROM alumno_profesor_matper WHERE apm_clave_materia_periodo = ?', [cla], function (err, rows){
			if(!err && rows.length != 0){
				for(i=0;i<rows.length;i++){
					alumnos.push(rows[i].apm_matricula_alumno);
				}
				connection.query('SELECT * FROM actividades WHERE act_clave_materia_periodo = ? AND act_nombre = ?', [cla, nac], function (err, rows){
					if(!err && rows.length == 0){
						connection.query('INSERT INTO actividades VALUES(?, ?, ?)', [null, nac, cla], function (err, rows){
							clact = rows.insertId;
							for(i=0;i<alumnos.length;i++){
								(function (alu){
									connection.query('INSERT INTO evaluaciones VALUES(?, ?, ?, ?, ?, ?, ?)', [null, alu, clact, null, null, null, null]);
								})(alumnos[i]);
							}
						});
					}
					data = ['Actividad dada de alta exitosamente'];
					res.send(data);
				});
			}
		});
	}else{
		connection.query('UPDATE actividades SET act_nombre = ?', [nac]);
		data = ['Actividad actualizada exitosamente'];
		res.send(data);
	}
	setTimeout(function(){
		next();
	},1000);	
});

app.get('/delactivity', function (req, res, next){
	act = JSON.parse(req.query.actividad);
	cla = act.act_clave_actividad;
	nom = act.act_nombre;
	cmp = act.act_clave_materia_periodo;
	connection.query('DELETE FROM actividades WHERE act_clave_actividad = ? AND act_nombre = ? AND act_clave_materia_periodo = ?', [cla, nom, cmp], function (err){
		if(err){
			res.send(err);
		}else{
			connection.query('DELETE FROM evaluaciones WHERE eva_clave_actividad = ?', [cla]);
			connection.query('DELETE FROM rubricas WHERE rub_clave_actividad = ?', [cla]);
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
		next();
	});
});

/*SELECT * FROM niveles WHERE niv_clave_actividad IN (SELECT MIN(niv_clave_actividad) FROM niveles WHERE  niv_clave_subcompetencia = ?) AND niv_clave_subcompetencia = ? UNION SELECT * FROM  niveles WHERE  niv_clave_subcompetencia = ? AND niv_clave_actividad IS NULL AND niv_nivel NOT IN (SELECT niv_nivel FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_clave_actividad IN (SELECT MIN(niv_clave_actividad) FROM niveles WHERE  niv_clave_subcompetencia = ?)) ORDER BY niv_nivel*/

app.get('/getactivitylevels', function (req, res, next){
	cla = req.query.clave;
	sco = req.query.subcom;
	subcoms = [];
	if(cla){
		connection.query('SELECT rub_clave_subcompetencia, rub_nivel_requerido, sco_descripcion_subcompetencia FROM rubricas LEFT OUTER JOIN subcompetencias ON rubricas.rub_clave_subcompetencia = subcompetencias.sco_clave_subcompetencia WHERE rub_clave_actividad = ? ORDER BY rub_clave_subcompetencia', [cla], function (err, rows){
			if(!err && rows.length != 0){
				for(i=0;i<rows.length;i++){
					(function (sub, nir, des){
						connection.query('SELECT * FROM niveles WHERE niv_clave_actividad IN (SELECT MIN(niv_clave_actividad) FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_clave_actividad = ?) AND niv_clave_subcompetencia = ? UNION SELECT * FROM  niveles WHERE  niv_clave_subcompetencia = ? AND niv_clave_actividad IS NULL AND niv_nivel NOT IN (SELECT niv_nivel FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_clave_actividad IN (SELECT MIN(niv_clave_actividad) FROM niveles WHERE  niv_clave_subcompetencia = ? AND niv_clave_actividad = ?)) ORDER BY niv_nivel', [sub, cla, sub, sub, sub, sub, cla], function (err, rows){
							if(!err && rows.length != 0){
								subcoms.push({subcompetence: sub, level_required:nir, description: des, rows});
							}
						});
					})(rows[i].rub_clave_subcompetencia, rows[i].rub_nivel_requerido, rows[i].sco_descripcion_subcompetencia);
				}
			}
		});
	}
	if(cla && sco){
		connection.query('SELECT sco_descripcion_subcompetencia FROM subcompetencias WHERE sco_clave_subcompetencia = ?', [sco], function (err, rows){
			if(!err && rows.length != 0){
				(function (des){
					connection.query('SELECT * FROM niveles WHERE niv_clave_subcompetencia = ? ORDER BY niv_nivel', [sco], function (err, rows){
						if(!err && rows.length != 0){
							subcoms.push({subcompetence: sco, level_required: "", description: des, rows});
						}
					});
				})(rows[0].sco_descripcion_subcompetencia);
			}
		});
	}
	setTimeout(function(){
		res.send(subcoms);
		next();
	},1000);
});

app.get('/getme', function (req, res, next){
	connection.query('SELECT * FROM alumnos WHERE alu_matricula = ? LIMIT 1', [whoIsId], function (err, rows){
		if(!err && rows.length != 0){
			res.send(rows);
		}
		next();
	});
});

app.get('/updateactivityrubric', function (req, res, next){
	aru = JSON.parse(req.query.activityrubric);
	cla = req.query.clave;
	subcoms = [];
	if(cla && aru){
		for(i=0;i<aru.length;i++){
			subcoms.push(aru[i].subcompetence);
			(function (sub, nir){
				connection.query('SELECT * FROM rubricas WHERE rub_clave_actividad = ? AND rub_clave_subcompetencia = ? LIMIT 1', [cla, sub], function(err, rows){
					if(!err && rows.length == 0){
						connection.query('INSERT INTO rubricas VALUES(?, ?, ?)', [cla, sub, nir]);
					}else if(!err && rows.length != 0){
						connection.query('UPDATE rubricas SET rub_nivel_requerido = ? WHERE rub_clave_actividad = ? AND rub_clave_subcompetencia = ?', [nir, cla, sub]);
					}
				});
			})(aru[i].subcompetence, aru[i].level_required);
			for(j=0;j<aru[i].rows.length;j++){
				(function (sub, des, niv){
					connection.query('SELECT * FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_nivel = ?', [sub, niv], function (err, rows){
						if(!err && rows.length > 1){
							connection.query('SELECT * FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_nivel = ? AND niv_clave_actividad = ?', [sub, niv, cla], function (err, rows){
								if(!err && rows.length != 0){
									if(rows[0].niv_descripcion.trim() != des.trim()){
										connection.query('UPDATE niveles SET niv_descripcion = ? WHERE niv_clave_subcompetencia = ? AND niv_nivel = ? AND niv_clave_actividad = ?', [des.trim(), sub, niv, cla]);
									}
								}
							});
						}else if(!err && rows.length == 1){
							if(rows[0].niv_descripcion.trim() != des.trim()){
								connection.query('INSERT INTO niveles VALUES(?, ?, ?, ?)', [sub, des.trim(), niv, cla]);
							}
						}
					});
				})(aru[i].subcompetence, aru[i].rows[j].niv_descripcion, aru[i].rows[j].niv_nivel);
			}
		}
	}
	setTimeout(function(){
		res.end();
		next();
	},1000);
});

app.get('/deleterubric', function (req, res, next){
	cla = req.query.clave;
	sub = req.query.subcom;
	connection.query('DELETE FROM rubricas WHERE rub_clave_actividad = ? AND rub_clave_subcompetencia = ?', [cla, sub]);
	connection.query('DELETE FROM niveles WHERE niv_clave_actividad = ? AND niv_clave_subcompetencia = ?', [cla, sub]);
	res.end();
	next();
});

// EVALUACIONES
app.get('/getevaluations', function (req, res, next){
	cla = req.query.clavact;
	alu = req.query.student;
	connection.query('SELECT * FROM evaluaciones WHERE eva_matricula_alumno = ? AND eva_clave_actividad = ? LIMIT 1', [alu, cla], function (err, rows){
		if(!err && rows.length != 0){
			res.send(rows);
		}else{
			res.end();
		}
		next();
	});	
});

app.get('/updatevaluations', function (req, res, next){
	cev = req.query.claeval;
	cla = req.query.clavact;
	alu = req.query.student;
	com = req.query.comentary;
	fup = req.query.feedup;
	fbk = req.query.feedback;
	ffd = req.query.feedforward;
	eva = JSON.parse(req.query.evaluations);
	for(i=0;i<eva.length;i++){
		(function (ele){
			connection.query('SELECT * FROM evaluacion_detalle WHERE ede_clave_evaluacion = ? AND ede_clave_subcompetencia = ?', [cev, ele.subcompetence], function (err, rows){
				if(!err && rows.length == 0){
					connection.query('INSERT INTO evaluacion_detalle VALUES(?, ?, ?, ?)', [cev, ele.subcompetence, ele.level_assigned, ele.comentary]);
				}else{
					connection.query('UPDATE evaluacion_detalle SET ede_nivel_asignado = ?, ede_comentario = ? WHERE ede_clave_evaluacion = ? AND ede_clave_subcompetencia = ?', [ele.level_assigned, ele.comentary, cev, ele.subcompetence]);
				}
			});
		})(eva[i]);
	}
	connection.query('UPDATE evaluaciones SET eva_comentario = ?, eva_feedup = ?, eva_feedback = ?, eva_feedforward = ? WHERE eva_matricula_alumno = ? AND eva_clave_actividad = ?', [com, fup, fbk, ffd, alu, cla]);
	data = ['Retroalimentación dada de alta exitosamente'];
	setTimeout(function(){
		res.send(data);
		next();
	});	
});


//CLAVE ORIGINAL ---------------- NO BORRAR AUN
/*'SELECT * FROM niveles WHERE niv_clave_actividad IN (SELECT MIN(niv_clave_actividad) FROM niveles WHERE  niv_clave_subcompetencia = ?) AND niv_clave_subcompetencia = ? UNION SELECT * FROM  niveles WHERE  niv_clave_subcompetencia = ? AND niv_clave_actividad IS NULL AND niv_nivel NOT IN (SELECT niv_nivel FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_clave_actividad IN (SELECT MIN(niv_clave_actividad) FROM niveles WHERE  niv_clave_subcompetencia = ?)) ORDER BY niv_nivel'*/

app.get('/getevaldetails', function (req, res, next){
	cla = req.query.clavact;
	eva = req.query.eval;
	evaluation = [];
	if(cla){
		connection.query('SELECT rub_clave_subcompetencia, rub_nivel_requerido, sco_descripcion_subcompetencia FROM rubricas LEFT OUTER JOIN subcompetencias ON rubricas.rub_clave_subcompetencia = subcompetencias.sco_clave_subcompetencia WHERE rub_clave_actividad = ? ORDER BY rub_clave_subcompetencia', [cla], function (err, rows){
			if(!err && rows.length != 0){
				for(i=0;i<rows.length;i++){
					(function (sub, nir, des){
						connection.query('SELECT * FROM evaluacion_detalle WHERE ede_clave_evaluacion = ? AND ede_clave_subcompetencia = ? LIMIT 1', [eva, sub], function (err, rows){
							nive = "";
							comp = "";
							if(!err && rows.length != 0){
								nive = rows[0].ede_nivel_asignado;
								comp = rows[0].ede_comentario;
							}
							(function (niv, com){
								connection.query('SELECT * FROM niveles WHERE niv_clave_actividad IN (SELECT MIN(niv_clave_actividad) FROM niveles WHERE  niv_clave_subcompetencia = ?) AND niv_clave_subcompetencia = ? UNION SELECT * FROM  niveles WHERE  niv_clave_subcompetencia = ? AND niv_clave_actividad IS NULL AND niv_nivel NOT IN (SELECT niv_nivel FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_clave_actividad IN (SELECT MIN(niv_clave_actividad) FROM niveles WHERE  niv_clave_subcompetencia = ?)) ORDER BY niv_nivel', [sub, sub, sub, sub, sub], function (err, rows){
									if(!err && rows.length != 0){
										evaluation.push({subcompetence: sub, level_required: nir, level_assigned: niv, comentary: com, description: des, rows});
									}
								});
							})(nive, comp);
						});
					})(rows[i].rub_clave_subcompetencia, rows[i].rub_nivel_requerido, rows[i].sco_descripcion_subcompetencia);
				}
			}
		});
	}
	setTimeout(function(){
		res.send(evaluation);
		next();
	},1000);
});

app.get('/courseprofandstud', function (req, res, next){
	clave = req.query.clave;
	prof = [];
	stud = [];
	profesores = [];
	estudiantes = [];
	relation = [];
	connection.query('SELECT * FROM alumno_profesor_matper WHERE apm_clave_materia_periodo = ?', [clave], function (err, rows){
		if(!err && rows.length != 0){
			relation.push(rows);
			for(i=0;i<rows.length;i++){
				prof.push(rows[i].apm_nomina_profesor);
				stud.push(rows[i].apm_matricula_alumno);
			}
			connection.query('SELECT pro_nomina, pro_nombre, pro_apellido_paterno, pro_apellido_materno FROM profesores WHERE pro_nomina IN(?)', [prof], function (err, rows){
				if(!err && rows.length != 0){
					profesores.push(rows);
				}
			});
			connection.query('SELECT alu_matricula, alu_nombre, alu_apellido_paterno, alu_apellido_materno FROM alumnos WHERE alu_matricula IN(?)', [stud], function (err, rows){
				if(!err && rows.length != 0){
					estudiantes.push(rows);
				}
			});
		}
	});
	setTimeout(function(){
		data = {prof: profesores, stud: estudiantes, rel: relation};
		res.send(data);
		next();
	},1000);
});

// PROFESOR
app.get('/allprofesor', function (req, res, next){
	connection.query('SELECT * FROM profesores', function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'Usuario no registrado, verifique bien su usuario y contraseña, si el problema persiste, contacte con el administrador!'});
		}else{
			res.send(rows);
		}
		next();
	});
});

app.get('/updateprofesor', function (req, res, next){
	data = JSON.parse(req.query.profesor);
	nomina = data.pro_nomina;
	nombre = data.pro_nombre;
	appat = data.pro_apellido_paterno;
	apmat = data.pro_apellido_materno;
	pass = data.pro_password;
	rol = data.pro_rol;
	connection.query('SELECT * FROM profesores WHERE pro_nomina = ? LIMIT 1', [nomina], function (err, rows, fields){
		if(!err && rows.length == 0){
			connection.query('INSERT INTO profesores VALUES(?, ?, ?, ?, ?, ?)', [nomina, nombre, appat, apmat, pass, rol], function (err){
				if(err){
					data = [err];
					res.send(err);
				}else{
					data = ['Profesor dado de alta exitosamente'];
					res.send(data);
				}
			});
		}else{
			connection.query('UPDATE profesores SET pro_nombre = ?, pro_apellido_paterno = ?, pro_apellido_materno = ?, pro_password = ?, pro_rol = ? WHERE pro_nomina = ?', [nombre, appat, apmat, pass, rol, nomina], function (err){
				if(err){
					data = [err];
					res.send(err);
				}else{
					data = ['Datos del profesor actualizados correctamente'];
					res.send(data);
				}
			})
		}
	});
	setTimeout(function(){
		next();
	},1000);
});

app.get('/delprofesor', function (req, res, next){
	nomina = req.query.profesor;
	connection.query('DELETE FROM profesores WHERE pro_nomina = ?', [nomina], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
		next();
	});	
});

app.get('/masiveprofesor', function (req, res, next){
	data = JSON.parse(req.query.datos);
	answer = [];
	registros = [];
	good = 0;
	bad = 0;
	incorrect = 0;
	for(i=1;i<data.length;i++){
		str = 'SELECT * FROM profesores WHERE pro_nomina = ? LIMIT 1';
		usrfc = data[i][0].substring(0,1);
		if(usrfc == "L"){
			(function (usr){	
				doQuery(str, usr[0], function(){
					if(srch == "false"){
						str = 'INSERT INTO profesores VALUES(?, ?, ?, ?, ?, ?)';
						doQuery(str, usr);
						good = good + 1;
						registros.push('Usuario '+String(usr[0])+' subido exitosamente.\r\n');
					}else{
						bad = bad + 1;
						registros.push('Usuario '+String(usr[0])+' ya existe.\r\n');
					}
				});
			})(data[i]);
		}else{
			incorrect = incorrect + 1;
			registros.push('El usuario '+String(data[i][0])+' no puede ser dado de alta. Solo puede dar de alta usuarios que comienzen con "L########"\r\n');
		}
	};
	setTimeout(function(){
		answer.push("<br>Total de registros procesados: "+(data.length-1)+"<br><br>Registrados dados de alta exitosamente: "+good+"<br><br>"+"Registros que ya existían: "+bad+"<br><br>"+"Registros que no eran profesores: "+incorrect+"<br><br><a id='logupload' href='#'>Ver detalles del proceso</a>");
		totalanswer = {ans: answer, reg: registros};
		res.send(totalanswer);
		next();
	},2500);	
});

app.get('/getprofesor', function (req, res, next){
	cla = req.query.clave;
	stu = req.query.student;
	connection.query('SELECT apm_nomina_profesor FROM alumno_profesor_matper WHERE apm_matricula_alumno = ? AND apm_clave_materia_periodo = ? LIMIT 1', [stu, cla], function (err, rows){
		if(!err && rows.length != 0){
			connection.query('SELECT pro_nombre, pro_apellido_paterno, pro_apellido_materno FROM profesores WHERE pro_nomina = ? LIMIT 1', [rows[0].apm_nomina_profesor], function (err, rows){
				if(!err && rows.length != 0){
					res.send(rows);
				}
			});
		}
	});
	setTimeout(function(){
		next();
	},1000);
});


// ALUMNOS
app.get('/allstudent', function (req, res, next){
	connection.query('SELECT * FROM alumnos WHERE alu_matricula != "A00000000"', function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'Usuario no registrado, verifique bien su usuario y contraseña, si el problema persiste, contacte con el administrador!'});
		}else{
			res.send(rows);
		}
		next();
	});	
});

app.get('/updatestudent', function (req, res, next){
	data = JSON.parse(req.query.alumno);
	trans = req.query.type_trans;
	matr = data.alu_matricula;
	nombre = data.alu_nombre;
	appat = data.alu_apellido_paterno;
	apmat = data.alu_apellido_materno;
	pass = data.alu_password;
	nivel = data.alu_nivel_academico;
	if(trans == "true"){
		connection.query('SELECT * FROM alumnos WHERE alu_matricula = ? LIMIT 1', [matr], function (err, rows){
			if(!err && rows.length == 0){
				connection.query('INSERT INTO alumnos VALUES(?, ?, ?, ?, ?, ?)', [matr, nombre, appat, apmat, pass, nivel], function (err){
					if(err){
						data = [err];
						res.send(err);
					}else{
						data = ['Alumno dado de alta exitosamente'];
						res.send(data);
					}
				});
			}else{
				data = ['Registro invalido, ya existe en la base de datos'];
				res.send(data);
			}
		});
	}else{
		connection.query('SELECT * FROM alumnos WHERE alu_matricula = ? LIMIT 1', [matr], function (err, rows){
			if(!err && rows.length == 1){
				connection.query('UPDATE alumnos SET alu_nombre = ?, alu_apellido_paterno = ?, alu_apellido_materno = ?, alu_password = ?, alu_nivel_academico = ? WHERE alu_matricula = ?', [nombre, appat, apmat, pass, nivel, matr], function (err){
					if(err){
						data = [err];
						res.send(data);
					}else{
						data = ['Datos del alumno actualizados correctamente'];
						res.send(data);
					}
				});
			}else{
				data = [err];
				res.send(data);
			}
		});
	}
	setTimeout(function(){
		next();
	},1000);
});

app.get('/delstudent', function (req, res, next){
	matr = req.query.alumno;
	connection.query('DELETE FROM alumnos WHERE alu_matricula = ?', [matr], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
		next();
	});
});

app.get('/masivestudent', function (req, res, next){
	data = JSON.parse(req.query.datos);
	answer = [];
	registros = [];
	good = 0;
	bad = 0;
	incorrect = 0;
	for(i=1;i<data.length;i++){
		str = 'SELECT * FROM alumnos WHERE alu_matricula = ? LIMIT 1';
		usrfc = data[i][0].substring(0,1);
		if(usrfc == "A"){
			(function (usr){	
				doQuery(str, usr[0], function(){
					if(srch == "false"){
						str = 'INSERT INTO alumnos VALUES(?, ?, ?, ?, ?, ?)';
						doQuery(str, usr);
						good = good + 1;
						registros.push('Alumno '+String(usr[0])+' subido exitosamente.\r\n');
					}else{
						bad = bad + 1;
						registros.push('Alumno '+String(usr[0])+' ya existe.\r\n');
					}
				});
			})(data[i]);
		}else{
			incorrect = incorrect + 1;
			registros.push('El usuario '+String(data[i][0])+' no puede ser dado de alta. Solo puede dar de alta usuarios que comienzen con "A########"\r\n');
		}
	}
	setTimeout(function(){
		answer.push("<br>Total de registros procesados: "+(data.length-1)+"<br><br>Registrados dados de alta exitosamente: "+good+"<br><br>"+"Registros que ya existían: "+bad+"<br><br>"+"Registros que no eran alumnos: "+incorrect+"<br><br><a id='logupload' href='#'>Ver detalles del proceso</a>");
		totalanswer = {ans: answer, reg: registros};
		res.send(totalanswer);
		next();
	},2500);
});

// MATERIAS, PROFESORES Y ALUMNOS
app.get('/allteachandstud', function (req, res, next){
	profesores = [];
	estudiantes = [];
	connection.query("SELECT pro_nomina, pro_nombre, pro_apellido_paterno, pro_apellido_materno FROM profesores", function (err, rows){
		if(!err && rows.length != 0){
			profesores = rows;
		}
	});
	connection.query('SELECT alu_matricula, alu_nombre, alu_apellido_paterno, alu_apellido_materno FROM alumnos WHERE alu_matricula != "A00000000"' , function (err, rows){
		if(!err && rows.length != 0){
			estudiantes = rows;
		}
	});
	setTimeout(function(){
		data = { teachers: profesores, students: estudiantes };
		res.send(data);
		next();
	},1000);
});

app.get('/updatepeoplecourse', function (req, res, next){
	periodo = req.query.period;
	curso = req.query.course;
	gente = JSON.parse(req.query.people);
	data = [];
	profesores = [];
	alumnos = [];
	for(i=0;i<gente.items.length;i++){
		if(gente.items[i].alumnos){
			for(j=0;j<gente.items[i].alumnos.length;j++){
				profesores.push(gente.items[i].profesor);
				alumnos.push(gente.items[i].alumnos[j].alu_matricula);
			}
		}else{
			profesores.push(gente.items[i].profesor);
			alumnos.push("A00000000");
		}
	}
	connection.query("SELECT mpe_clave_materia_periodo FROM materia_periodo WHERE mpe_clave_periodo = ? AND mpe_clave_materia = ? LIMIT 1", [periodo, curso], function (err, rows){
		if(!err && rows.length != 0){
			clave = rows[0].mpe_clave_materia_periodo;
			connection.query("DELETE FROM alumno_profesor_matper WHERE apm_clave_materia_periodo = ? AND apm_nomina_profesor NOT IN(?)", [clave, profesores]);
			connection.query("DELETE FROM alumno_profesor_matper WHERE apm_clave_materia_periodo = ? AND apm_matricula_alumno NOT IN(?)", [clave, alumnos]);
			for(i=0;i<profesores.length;i++){
				(function (pro, alu){
					connection.query("SELECT * FROM alumno_profesor_matper WHERE apm_clave_materia_periodo = ? AND apm_nomina_profesor = ? AND apm_matricula_alumno = ?", [clave, pro, alu], function (err, rows){
						if(!err && rows.length == 0){
							if(alu == "A00000000"){
								connection.query("INSERT INTO alumno_profesor_matper VALUES(?, ?, ?)", [alu, pro, clave]);
							}else{
								connection.query("INSERT INTO alumno_profesor_matper VALUES(?, ?, ?)", [alu, pro, clave]);
							}
						}
					});
				})(profesores[i], alumnos[i]);
			}
		}
	});
	data.push("Información actualizada correctamente");
	setTimeout(function(){
		res.send(data);
		next();
	},1000);
});

app.get('/teacherandstudentsfromcourse', function (req, res, next){
	periodo = req.query.period;
	curso = req.query.course;
	lista = {items:[]};
	connection.query('SELECT mpe_clave_materia_periodo FROM materia_periodo WHERE mpe_clave_periodo = ? AND mpe_clave_materia = ? LIMIT 1', [periodo, curso], function (err, rows){
		if(!err && rows.length != 0){
			clave = rows[0].mpe_clave_materia_periodo;
			connection.query('SELECT apm_nomina_profesor FROM alumno_profesor_matper WHERE apm_clave_materia_periodo = ? AND apm_matricula_alumno = "A00000000"', [clave], function (err, rows){
				if(!err && rows.length != 0){
					for(i=0;i<rows.length;i++){
						lista.items.push({profesor: rows[i].apm_nomina_profesor});
					}
				}
			});
			connection.query('SELECT apm_nomina_profesor, alu_matricula, alu_nombre, alu_apellido_paterno, alu_apellido_materno FROM alumno_profesor_matper INNER JOIN alumnos ON apm_matricula_alumno = alu_matricula WHERE apm_clave_materia_periodo = ? ORDER BY apm_nomina_profesor', [clave], function (err, rows){
				if(!err && rows.length != 0){
					prof = "";
					students = [];
					flag = true;
					for(i=0;i<rows.length;i++){
						if(flag){
							prof_actual = rows[i].apm_nomina_profesor;
							flag = false;
						}
						if(i == 0 && rows[i].alu_matricula == "A00000000"){
							lista.items.push({profesor: prof_actual, alumnos: []});
							flag = true;
							continue;
						}else if(i != 0 && rows[i].alu_matricula == "A00000000"){
							lista.items.push({profesor: prof_actual, alumnos: students});
							flag = true;
							continue;
						}
						if(prof_actual != rows[i].apm_nomina_profesor){
							lista.items.push({profesor: prof_actual, alumnos: students});
							prof_actual = rows[i].apm_nomina_profesor;
							students = [];
						}
						if(i == rows.length-1){
							lista.items.push({profesor: prof_actual, alumnos: students});
						}
						students.push({ alu_matricula: rows[i].alu_matricula, alu_nombre: rows[i].alu_nombre, alu_apellido_paterno: rows[i].alu_apellido_paterno, alu_apellido_materno: rows[i].alu_apellido_materno });
					}
					res.send(lista);
				}else{
					res.send({ status: 'error', text: 'Este curso no tiene profesores ni alumnos asignados de momento!'});
				}
			});
		}
	});
	setTimeout(function(){
		next();
	},1000);
});


// COMPETENCIAS
app.get('/allcompetence', function (req, res, next){
	connection.query('SELECT * FROM competencias', function (err, rows){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay competencias registradas de momento!'});
		}else{
			res.send(rows);
		}
		next();
	});
});

app.get('/updatecompetence', function (req, res, next){
	data = JSON.parse(req.query.competencia);
	trans = req.query.type_trans;
	clave = data.com_clave_competencia;
	desc = data.com_descripcion_competencia;
	cate = data.com_categoria_competencia;
	fijo = data.com_fijo;
	if(trans == "true"){
		connection.query('SELECT * FROM competencias WHERE com_clave_competencia = ? LIMIT 1', [clave], function (err, rows, fields){
			if(!err && rows.length == 0){
				connection.query('INSERT INTO competencias VALUES(?, ?, ?, ?)', [clave, desc, cate, fijo], function (err){
					if(err){
						data = [err];
						res.send(err);
					}else{
						data = ['Competencia dada de alta exitosamente'];
						res.send(data);
					}
				});
			}else{
				data = ['Registro invalido, ya existe en la base de datos'];
				res.send(data);
			}
		});
	}else{
		connection.query('SELECT * FROM competencias WHERE com_clave_competencia = ? LIMIT 1', [clave], function (err, rows, fields){
			if(!err && rows.length == 1){
				connection.query('UPDATE competencias SET com_descripcion_competencia = ?, com_categoria_competencia = ?, com_fijo = ? WHERE com_clave_competencia = ?', [desc, cate, fijo, clave], function (err){
					if(err){
						data = [err];
						res.send(data);
					}else{
						data = ['Detalles de la competencia actualizados correctamente'];
						res.send(data);
					}
				});
			}else{
				data = [err];
				res.send(data);
			}
		});
	}
	setTimeout(function(){
		next();
	},1000);
});

app.get('/delcompetence', function (req, res, next){
	clave = req.query.competencia;
	connection.query('DELETE FROM competencias WHERE com_clave_competencia = ?', [clave], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
		next();
	});
});

app.get('/allsubcompetence', function (req, res, next){
	clave_com = req.query.competencia;
	connection.query('SELECT * FROM subcompetencias WHERE sco_clave_competencia = ?', [clave_com], function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay competencias registradas de momento!'});
		}else{
			res.send(rows);
		}
		next();
	});
});

app.get('/updatesubcompetence', function (req, res, next){
	data = JSON.parse(req.query.subcompetencia);
	trans = req.query.type_trans;
	cla_com = req.query.competencia;
	clave = data.sco_clave_subcompetencia;
	desc = data.sco_descripcion_subcompetencia;
	fijo = data.sco_fijo;
	taxo = data.sco_taxonomia;
	levels = [];
	if(taxo === "Marzano y Kendall"){
		levels = [{level: 1, desclvl: "Recuperación"}, {level: 2, desclvl: "Comprensión"}, {level: 3, desclvl: "Análisis"}, {level: 4, desclvl: "Utilización del conocimiento"}];
	}else if(taxo === "Simpson"){
		levels = [{level: 1, desclvl: "Percepción"}, {level: 2, desclvl: "Disposición"}, {level: 3, desclvl: "Respuesta dirigida"}, {level: 4, desclvl: "Mecanismo"}, {level: 5, desclvl: "Respuestas complejas y manifiestas"}, {level: 6, desclvl: "Adaptación"}, {level: 7, desclvl: "Creación"}];
	}else if(taxo === "Krathwohl"){
		levels = [{level: 1, desclvl: "Recibir"}, {level: 2, desclvl: "Responder"}, {level: 3, desclvl: "Valorar"}, {level: 4, desclvl: "Organizar"}, {level: 5, desclvl: "Caracterizar"}];
	}
	connection.query('SELECT * FROM competencias WHERE com_clave_competencia = ? LIMIT 1', [cla_com], function (err, rows){
		if(!err && rows.length == 0){
			data = ['Error, la clave de la competencia no existe!'];
			res.send(data);
		}
	});
	connection.query('SELECT * FROM subcompetencias WHERE sco_clave_subcompetencia = ? LIMIT 1', [clave], function (err, rows){
		if(!err && rows.length == 0 && trans == "true"){
			connection.query('INSERT INTO subcompetencias VALUES(?, ?, ?, ?, ?)', [clave, desc, cla_com, fijo, taxo], function (err){
				if(err){
					data = [err];
					res.send(err);
				}else{
					for(i=0;i<levels.length;i++){
						connection.query('INSERT INTO niveles VALUES(?, ?, ?, ?)', [clave, levels[i].desclvl, levels[i].level, null]);
					}
					data = ['Subcompetencia dada de alta exitosamente'];
					res.send(data);
				}
			});
		}else if(!err && rows.length == 1 && trans == "false"){
			connection.query('UPDATE subcompetencias SET sco_descripcion_subcompetencia = ?, sco_fijo = ?, sco_taxonomia = ? WHERE sco_clave_subcompetencia = ?', [desc, fijo, taxo, clave], function (err){
				if(err){
					data = [err];
					res.send(data);
				}else{
					data = ['Detalles de la subcompetencia actualizados correctamente'];
					res.send(data);
				}
			});
		}else{
			data = ['Registro invalido, ya existe en la base de datos'];
			res.send(data);
		}
	});
	setTimeout(function(){
		next();
	},1000);
});

app.get('/delsubcompetence', function (req, res, next){
	clave = req.query.subcompetencia;
	connection.query('DELETE FROM subcompetencias WHERE sco_clave_subcompetencia = ?', [clave], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
		next();
	});
});

app.get('/masivedelsubcompetence', function (req, res, next){
	data = JSON.parse(req.query.competencia);
	clave = data.com_clave_competencia;
	desc = data.com_descripcion_competencia;
	connection.query('DELETE FROM subcompetencias WHERE sco_clave_competencia = ?', [clave], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Todas las subcompetencias para la competencia ' + clave + ' ' + desc + ' ' + ' fueron borradas!'];
			res.send(data);
		}
		next();
	});
});

app.get('/alllevels', function (req, res, next){
	clave = req.query.subcompetencia;
	connection.query('SELECT * FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_clave_actividad IS NULL ORDER BY niv_nivel', [clave], function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay niveles registrados de momento!'});
		}else{
			res.send(rows);
		}
		next();
	});
});

app.get('/updatelevel', function (req, res, next){
	data = JSON.parse(req.query.nivel);
	trans = req.query.type_trans;
	cla_sco = req.query.subcompetencia;
	nivel = data.niv_nivel;
	desc = data.niv_descripcion;
	connection.query('SELECT * FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_nivel = ? LIMIT 1', [cla_sco, nivel], function (err, rows){
		if(!err && rows.length == 0 && trans == "true"){
			connection.query('INSERT INTO niveles VALUES(?, ?, ?, ?)', [cla_sco, desc, nivel, null], function (err){
				if(err){
					data = [err];
					res.send(err);
				}else{
					data = ['Nuevo nivel dado de alta exitosamente'];
					res.send(data);
				}
			});
		}else if(!err && rows.length == 1 && trans == "false"){
			connection.query('UPDATE niveles SET niv_descripcion = ? WHERE niv_clave_subcompetencia = ? AND niv_nivel = ?', [desc, cla_sco, nivel], function (err){
				if(err){
					data = [err];
					res.send(data);
				}else{
					data = ['Descripción del nivel actualizado correctamente'];
					res.send(data);
				}
			});
		}else{
			data = ['Registro invalido, ya existe en la base de datos'];
			res.send(data);
		}
	});
	setTimeout(function(){
		next();
	},1000);
});

app.get('/dellevel', function (req, res, next){
	cla_sco = req.query.subcompetencia;
	nivel = req.query.nivel;
	connection.query('DELETE FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_nivel = ?', [cla_sco, nivel], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Nivel borrado exitosamente'];
			res.send(data);
		}
		next();
	});
});

app.get('/masivedellevel', function (req, res, next){
	data = JSON.parse(req.query.subcompetencia);
	cla_sco = data.sco_clave_subcompetencia;
	desc = data.sco_descripcion_subcompetencia;
	connection.query('DELETE FROM niveles WHERE niv_clave_subcompetencia = ?', [cla_sco], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Todos los niveles para la subcompetencia ' + cla_sco + ' ' + desc + ' ' + ' fueron borrados!'];
			res.send(data);
		}
		next();
	});
});

app.get('/checklevels', function (req, res, next){
	data = req.query.competencia;
	flag = false;
	approvedOrNot = [];
	string = 'SELECT * FROM niveles WHERE niv_clave_subcompetencia = ?';
	for(i=0;i<data.length;i++){
		doQuery(string, data[i]);
	};
	setTimeout(function(){
		res.send(approvedOrNot);
		next();
	},1000);
});

// MATERIAS
app.get('/allsubjects', function (req, res, next){
	connection.query('SELECT * FROM materias', function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay materias registradas de momento!'});
		}else{
			res.send(rows);
		}
		next();
	});
});

app.get('/updatesubject', function (req, res, next){
	data = JSON.parse(req.query.materia);
	trans = req.query.type_trans;
	clave = data.mat_clave_materia;
	desc = data.mat_nombre_materia;
	nivel = data.mat_nivel_academico;
	connection.query('SELECT * FROM materias WHERE mat_clave_materia = ? LIMIT 1', [clave], function (err, rows){
		if(!err && rows.length == 0 && trans == "true"){
			connection.query('INSERT INTO materias VALUES(?, ?, ?)', [clave, desc, nivel], function (err){
				if(err){
					data = [err];
					res.send(err);
				}else{
					data = ['Materia dada de alta exitosamente'];
					res.send(data);
				}
			});
		}else if(!err && rows.length == 1 && trans == "false"){
			connection.query('UPDATE materias SET mat_nombre_materia = ?, mat_nivel_academico = ? WHERE mat_clave_materia = ?', [desc, nivel, clave], function (err){
				if(err){
					data = [err];
					res.send(data);
				}else{
					data = ['Información de la materia actualizada correctamente'];
					res.send(data);
				}
			});
		}else{
			data = ['Registro invalido, ya existe en la base de datos'];
			res.send(data);
		}
	});
	setTimeout(function(){
		next();
	},1000);
});

app.get('/delsubject', function (req, res, next){
	clave = req.query.materia;
	connection.query('DELETE FROM materias WHERE mat_clave_materia = ?', [clave], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Materia borrada exitosamente'];
			res.send(data);
		}
		next();
	});
});

// PERIODO Y MATERIAS
app.get('/allsubjectperiod', function (req, res, next){
	program = req.query.program;
	period = req.query.period;
	year = req.query.year;
	subject = req.query.subject;
	string = 'SELECT * FROM materia_periodo WHERE ';
	if(program){
		string += "mpe_clave_periodo LIKE '%"+program+"%'";
	}
	if(program && period){
		string += " AND ";
	}
	if(period){
		string += "mpe_clave_periodo LIKE '%"+period+"%'";
	}
	if(period && year){
		string += " AND ";
	}
	if(year){
		string += "mpe_clave_periodo LIKE '%"+year+"%'";
	}
	connection.query(string, function (err, rows, fields){
		if(!err && rows.length != 0){
			data = [];
			for(i=0;i<rows.length;i++){
				data.push(rows[i].mpe_clave_materia);
			}
			connection.query('SELECT * FROM materias WHERE mat_clave_materia IN (?)', [data], function (err, rows){
				res.send(rows);
			})
		}else{
			res.send(null);
		}
	});
	setTimeout(function(){
		next();
	},1000);
});

app.get('/allsubjectinscribed', function (req, res, next){
	program = req.query.program;
	period = req.query.period;
	year = req.query.year;
	subject = req.query.subject;
	string = 'SELECT * FROM materia_periodo WHERE ';
	if(program){
		string += "mpe_clave_periodo LIKE '%"+program+"%'";
	}
	if(program && period){
		string += " AND ";
	}
	if(period){
		string += "mpe_clave_periodo LIKE '%"+period+"%'";
	}
	if(period && year){
		string += " AND ";
	}
	if(year){
		string += "mpe_clave_periodo LIKE '%"+year+"%'";
	}
	if(whoIsId.substring(0,1) === "L"){
		string2 = "SELECT * FROM alumno_profesor_matper WHERE apm_nomina_profesor = '"+whoIsId+"'";
	}
	if(whoIsId.substring(0,1) === "A"){
		string2 = "SELECT * FROM alumno_profesor_matper WHERE apm_matricula_alumno = '"+whoIsId+"'";
	}
	connection.query(string2, function (err, rows){
		if(!err && rows.length != 0){
			data = [];
			for(i=0;i<rows.length;i++){
				data.push(rows[i].apm_clave_materia_periodo);
			}
			string += " AND mpe_clave_materia_periodo IN ("+data+")";
			connection.query(string, function (err, rows){
				if(!err && rows.length != 0){
					data = [];
					for(i=0;i<rows.length;i++){
						data.push(rows[i].mpe_clave_materia);
					}
					connection.query('SELECT * FROM materias WHERE mat_clave_materia IN (?)', [data], function (err, rows){
						res.send(rows);
					})
				}else{
					res.send({status: 'error', text: 'No tienes ninguna materia inscrita en este periodo.'});
				}
			});
		}else{
			res.send({status: 'error', text: 'No tienes ninguna materia inscrita.'});
		}
	});
	setTimeout(function(){
		next();
	},1000);
});

app.get('/getmystudents', function (req, res, next){
	cla = req.query.clave;
	connection.query('SELECT * FROM alumno_profesor_matper WHERE apm_nomina_profesor = ? AND apm_clave_materia_periodo = ?', [whoIsId, cla], function (err, rows){
		if(!err && rows.length != 0){
			alumnos = [];
			for(i=0;i<rows.length;i++){
				alumnos.push(rows[i].apm_matricula_alumno);
			}
			connection.query('SELECT alu_matricula, alu_nombre, alu_apellido_paterno, alu_apellido_materno FROM alumnos WHERE alu_matricula IN(?)', [alumnos], function (err, rows){
				if(!err && rows.length != 0){
					res.send(rows);
				}
			})
		}else{
			res.send({status: 'error', text: 'No tienes alumnos inscritos para este curso.'});
		}
	});
	setTimeout(function(){
		next();
	},1000);
});

app.get('/updatesubjectperiod', function (req, res, next){
	subjectperiod = JSON.parse(req.query.materiaperiodo);
	period = req.query.periodo;
	claves = [];
	data = ["Error"];
	for(i=0;i<subjectperiod.length;i++){
		claves.push("'"+subjectperiod[i].mat_clave_materia+"'");
	}
	if(!claves.length){
		claves.push("''");
	}
	string = "SELECT * FROM materia_periodo WHERE mpe_clave_periodo LIKE '%"+period+"%' AND mpe_clave_materia NOT IN ("+claves+")";
	connection.query(string, function (err, rows){
		string2 = "DELETE FROM materia_periodo WHERE mpe_clave_periodo LIKE '%"+period+"%' AND mpe_clave_materia NOT IN ("+claves+")";
		////////////////////// REVISION DE REGISTROS ANTES DE BORRAR!!!!!!!!!!!!!!!!!!!!!!!!!
		connection.query(string2);
		for(i=0;i<claves.length;i++){
			string = "SELECT * FROM materia_periodo WHERE mpe_clave_periodo LIKE '%"+period+"%' AND mpe_clave_materia = "+claves[i]+" LIMIT 1";
			(function (str, key){
				connection.query(str, function (err, rows){
					if(!err && rows.length == 0 && key != "''"){
						(function (){
							string3 = "INSERT INTO materia_periodo VALUES("+null+", '"+period+"', "+key+")";
							connection.query(string3);
						})();
					}
				});
			})(string, claves[i]);
		}
		data = ["Los registros fueron actualizados correctamente"];
	});
	setTimeout(function(){
		res.send(data);
		next();
	},1000);
});


//FUNCIONES

//Funcion que genera y regresa un token
function giveToken(user, rol){
	expires = moment().add(600, 'seconds').valueOf();
	token = jwt.encode({
		iss: user,
		exp: expires,
		rol: rol
	}, app.get('jwtTokenSecret'));
	return token;
}

//Funcion que verifica la caducidad del token
function autenticate(token){
	vigent = false;
	if(token){
		if(token != 'undefined' && token != 'null'){
			decoded = jwt.decode(token, app.get('jwtTokenSecret'));
			if (decoded.exp <= Date.now()) {
				//Access token has expired
				vigent = false;
			}
			if (decoded.exp >= Date.now()) {
				//Access token still vigent
				vigent = true;
			}
		}
	}else{
		//Usuario no identificado
		vigent = false;
	}
	return vigent;
}

//Funcion que extiende el tiempo de sesion de usuario para que no expire si sigue activo
function extendTime(token){
	decoded = jwt.decode(token, app.get('jwtTokenSecret'));
	expires = moment().add(600, 'seconds').valueOf();
	token = jwt.encode({
		iss: decoded.iss,
		exp: expires,
		rol: decoded.rol
	}, app.get('jwtTokenSecret'));
	return token;
}

//Funcion que verifica el perfil del usuario
function whoAreYou(token){
	decoded = jwt.decode(token, app.get('jwtTokenSecret'));
	switch(decoded.rol){
		case 'hara':
			return 'Estudiante';
		case 'ejte':
			return 'Profesor';
		case 'hadjim':
			return 'Titular';
		case 'so-odu':
			return 'Administrador';
	}
}

//Funcion que detecta el rol del usuario y sus privilegios
function whoAreYouName(token, callback){
	decoded = jwt.decode(token, app.get('jwtTokenSecret'));
	user = decoded.iss;
	name = '';
	if(decoded.iss == 'L01421024'){
		callback('Jonathan Ayala Rodríguez', decoded.iss);
	}else{
		connection.query('SELECT * FROM alumnos WHERE alu_matricula = ? LIMIT 1', [user], function (err, rows) {
		if(!err && rows.length != 0){
				name = rows[0].alu_nombre + ' ' + rows[0].alu_apellido_paterno + ' ' + rows[0].alu_apellido_materno;
				callback(name, user);
			}
		});
		connection.query('SELECT * FROM profesores WHERE pro_nomina = ? LIMIT 1', [user], function (err, rows) {
			if(!err && rows.length != 0){
				name = rows[0].pro_nombre + ' ' + rows[0].pro_apellido_paterno + ' ' + rows[0].pro_apellido_materno;
				callback(name, user);
			}
		});
	}	
}

//Funcion que asigna el perfil del usuario
function thisIsYou(rol){
	switch(rol){
		case 'Estudiante':
			return 'hara';
		case 'Profesor':
			return 'ejte';
		case 'Titular':
			return 'hadjim';
		case 'Administrador':
			return 'so-odu';
	}
}

//Funcion que puede realizar queries sucevios con funcion callback
function doQuery (string, arrayValues, cllbckfn) {
	connection.query(string, arrayValues, function (err, rows){
		if(!err && rows.length != 0){
			srch = "true";
		}else{
			srch = "false";
		}
		if(cllbckfn && typeof(cllbckfn) == "function"){
			cllbckfn();
		}
	});
}



app.get('*', function (req, res, next){
	connection.end();
	console.log("conexion terminada");	
});