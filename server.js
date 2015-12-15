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

connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'competere'
});

/*connection = mysql.createConnection({
	host: '66.147.244.56',
	user: 'carosblu_jonas',
	password: 'jonas123',
	database: 'carosblu_competere',
	port: 3306
});*/

app.set('port', 3000);


app.use(function(req, res, next) {
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
app.use('/scripts', express.static(__dirname + '/controllers'));
app.use('/img', express.static(__dirname + '/resources'));


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


app.use(function (req, res, next){
	newTok = '';
	whoIs = '';
	route = '';
	whoIsName = '';
	next();
	/*token = req.headers.authorization;
	if(req.path == '/' || req.path == '/login' || req.path == '/logview'){
		if(autenticate(token)){
			newTok = extendTime(token);
			whoAreYou(token);
			res.redirect('/menu');
		}else{
			next();
		}
	}else{
		if(autenticate(token)){
			newTok = extendTime(token);
			whoIs = whoAreYou(newTok);

			whoAreYouName(newTok, function(name){
				whoIsName = name;
				next();
			});			
		}else{
			res.sendFile(__dirname + '/views/outlogin.html');
			whoIsName = '';
		}
	}*/
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

//Pantalla Menu con autenticacion
app.get('/menu', function (req, res, next){
	switch(whoIs){
		case 'Estudiante':
			route = '/views/menu_estud.html';
		case 'Profesor':
			route = '/views/menu_profr.html';
		case 'Titular':
			route = '/views/menu_titul.html';
		case 'Administrador':
			route = '/views/menu_admin.html';
		default:
			whoIs = '';
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
	}else{
		next();
	}
});


app.get('/login', function (req, res) {
	data = JSON.parse(req.query.user);

	user = data.usuario;
	pass = data.contrasena;

	connection.query('SELECT * FROM alumnos WHERE alu_matricula = ? AND alu_password = ? LIMIT 1', [user, pass], function (err, rows, fields) {
		if(err || rows.length == 0){
			connection.query('SELECT * FROM profesores WHERE pro_nomina = ? AND pro_password = ? LIMIT 1', [user, pass], function(err, rows, fields) {
				if(err || rows.length == 0){
					res.send({ status: 'error', text: 'Usuario no registrado, verifique bien su usuario y contraseña, si el problema persiste, contacte con el administrador!'});
				}else{
					res.send({ nombre: rows[0].pro_nombre + ' ' + rows[0].pro_apellido_paterno, token: giveToken(rows[0].pro_nomina, thisIsYou(rows[0].pro_rol)) });
				}
			});
		}else{
			res.send({ nombre: rows[0].alu_nombre + ' ' + rows[0].alu_apellido_paterno, token: giveToken(rows[0].alu_matricula, thisIsYou('estudiante')) });
		}
	});
});


app.get('/categories', function (req, res){
	connection.query('SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING(COLUMN_TYPE, 7, LENGTH(COLUMN_TYPE) - 8), "\',\'", 1 + units.i + tens.i * 10) , "\',\'", -1) FROM INFORMATION_SCHEMA.COLUMNS CROSS JOIN (SELECT 0 AS i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) units CROSS JOIN (SELECT 0 AS i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) tens WHERE TABLE_NAME = "subcompetencias" AND COLUMN_NAME = "sco_taxonomia"', function (err, rows){
		if(!err && rows.length != 0){
			elements = [];
			for(key in rows){
				ele = rows[key];
				elements.push(ele['SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING(COLUMN_TYPE, 7, LENGTH(COLUMN_TYPE) - 8), "\',\'", 1 + units.i + tens.i * 10) , "\',\'", -1)']);
			}
			res.send(elements);
		}
	});
});

app.get('/allsubcompetences', function (req, res){
	connection.query('SELECT * FROM subcompetencias', function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay competencias registradas de momento!'});
		}else{
			res.send(rows);
		}
	});
});

app.get('/filtersubcompetences', function (req, res){
	taxos = req.query.taxs;
	connection.query('SELECT * FROM subcompetencias WHERE sco_taxonomia IN(?)', [taxos], function (err, rows){
		if(!err && rows.length != 0){
			res.send(rows);
		}else{
			res.end();
		}
	});
});

app.get('/getclaperiod', function (req, res){
	per = req.query.periodo;
	clm = req.query.cla_mat;
	connection.query('SELECT mpe_clave_materia_periodo FROM materia_periodo WHERE mpe_clave_periodo = ? AND mpe_clave_materia = ? LIMIT 1', [per, clm], function (err, rows){
		if(!err && rows.length != 0){
			res.send(rows[0].mpe_clave_materia_periodo.toString());
		}else{
			res.end();
		}
	});
});

app.get('/updateexpertprofile', function (req, res){
	per = req.query.periodo;
	scs = JSON.parse(req.query.sco_claves_sub);
	data = [];
	subcom = [];
	nivels = [];
	for(i=0;i<scs.items.length;i++){
		subcom.push(scs.items[i].sco_clave_subcompetencia);
		nivels.push(scs.items[i].pem_nivel_requerido);
	}
	connection.query('DELETE FROM perfil_experto_materia_periodo WHERE pem_clave_materia_periodo = ? AND pem_clave_subcompetencia NOT IN(?)', [per, subcom], function (err){
		if(!err){
			for(i=0;i<subcom.length;i++){
				(function (sub, niv){
					connection.query('SELECT * FROM perfil_experto_materia_periodo WHERE pem_clave_materia_periodo = ? AND pem_clave_subcompetencia = ?', [per, sub], function (err, rows){
						if(!err && rows.length == 0){
							connection.query('INSERT INTO perfil_experto_materia_periodo VALUES(?, ?, ?)', [per, sub, niv]);
						}else{
							console.log(niv+"  "+per+"  "+sub);
							connection.query('UPDATE perfil_experto_materia_periodo SET pem_nivel_requerido = ? WHERE pem_clave_materia_periodo = ? AND pem_clave_subcompetencia = ?', [niv, per, sub]);
						}

					});
				})(subcom[i], nivels[i]);
			}
			data = ['Registros actualizados exitosamente'];
			res.send(data);
		}
	});

	/*connection.query('SELECT * FROM perfil_experto_materia_periodo WHERE pem_clave_materia_periodo = ? AND pem_clave_subcompetencia = ? LIMIT 1', [per, scs], function (err, rows){
		if(!err && rows.length == 0){
			connection.query('INSERT INTO perfil_experto_materia_periodo VALUES(?, ?, ?)', [per, scs, nim]);
			data = ['Registro dado de alta exitosamente'];
			res.send(data);
		}else{
			console.log(rows[0].pem_nivel_requerido);
			console.log(nim);
			if(rows[0].pem_nivel_requerido != nim){
				connection.query('UPDATE perfil_experto_materia_periodo SET pem_nivel_requerido = ? WHERE pem_clave_materia_periodo = ? AND pem_clave_subcompetencia = ?', [nim, per, scs], function (err){
					data = ['Registro actualizado exitosamente'];
					res.send(data);
				});
			}else{
				res.end();
			}
		}
	});*/
	/*connection.query("SELECT mpe_clave_materia_periodo FROM materia_periodo WHERE mpe_clave_periodo = ? AND mpe_clave_materia = ? LIMIT 1", [periodo, curso], function (err, rows){
		if(!err && rows.length != 0){
			clave = rows[0].mpe_clave_materia_periodo;
			connection.query("DELETE FROM alumno_profesor_materia_periodo WHERE apm_clave_materia_periodo = ? AND apm_nomina_profesor NOT IN(?)", [clave, profesores]);
			connection.query("DELETE FROM alumno_profesor_materia_periodo WHERE apm_clave_materia_periodo = ? AND apm_nomina_profesor NOT IN(?)", [clave, alumnos]);
			for(i=0;i<profesores.length;i++){
				(function (pro, alu){
					connection.query("SELECT * FROM alumno_profesor_materia_periodo WHERE apm_clave_materia_periodo = ? AND apm_nomina_profesor = ? AND apm_matricula_alumno = ?", [clave, pro, alu], function (err, rows){
						if(!err && rows.length == 0){
							connection.query("INSERT INTO alumno_profesor_materia_periodo VALUES(?, ?, ?)", [alu, pro, clave]);
						}
					});
				})(profesores[i], alumnos[i]);
			}
		}
	});
	data.push("Información actualizada correctamente");
	setTimeout(function(){
		res.send(data);
	},1000);*/
});

app.get('/getmaxprofiles', function (req, res){
	cla = req.query.clave;
	connection.query('SELECT * FROM perfil_experto_materia_periodo WHERE pem_clave_materia_periodo = ?', [cla], function (err, rows){
		if(!err && rows.length != 0){
			res.send(rows);
		}else{
			res.end();
		}
	});
});

app.get('/getactivities', function (req, res){
	cla = req.query.clave;
	connection.query('SELECT * FROM actividades WHERE act_clave_materia_periodo = ?', [cla], function (err, rows){
		if(!err && rows.length != 0){
			res.send(rows);
		}else{
			res.end();
		}
	});
});

app.get('/updateactivity', function (req, res){
	cla = req.query.clave;
	nac = req.query.nombre;
	trans = req.query.type_trans;
	if(trans == "true"){
		connection.query('SELECT * FROM actividades WHERE act_clave_materia_periodo = ? AND act_nombre = ?', [cla, nac], function (err, rows){
			if(!err && rows.length == 0){
				connection.query('INSERT INTO actividades VALUES(?, ?, ?)', [null, nac, cla]);
			}
			data = ['Actividad dada de alta exitosamente'];
			res.send(data);
		});
	}else{
		connection.query('UPDATE actividades SET act_nombre = ?', [nac]);
		data = ['Actividad actualizada exitosamente'];
		res.send(data);
	}
});

app.get('/delactivity', function (req, res){
	act = JSON.parse(req.query.actividad);
	cla = act.act_clave_actividad;
	nom = act.act_nombre;
	cmp = act.act_clave_materia_periodo;
	connection.query('DELETE FROM actividades WHERE act_clave_actividad = ? AND act_nombre = ? AND act_clave_materia_periodo = ?', [cla, nom, cmp], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
	});
});



// PROFESOR
app.get('/allprofesor', function (req, res){
	connection.query('SELECT * FROM profesores', function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'Usuario no registrado, verifique bien su usuario y contraseña, si el problema persiste, contacte con el administrador!'});
		}else{
			res.send(rows);
		}
	});
});

app.get('/updateprofesor', function (req, res){
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
});

app.get('/delprofesor', function (req, res){
	nomina = req.query.profesor;
	connection.query('DELETE FROM profesores WHERE pro_nomina = ?', [nomina], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
	});
});

app.get('/masiveprofesor', function (req, res){
	data = JSON.parse(req.query.datos);
	approvedOrNot = [];
	/*string = 'INSERT INTO profesores VALUES(?, ?, ?, ?, ?, ?)';*/
	string = 'SELECT * FROM profesores WHERE pro_nomina = ? LIMIT 1';
	for(i=0;i<data.length;i++){
		doQuery(string, data[i][0]);
	};
	setTimeout(function(){
		answer = [];
		string = 'INSERT INTO profesores VALUES(?, ?, ?, ?, ?, ?)';
		for(i=0;i<approvedOrNot.length;i++){
			if(!approvedOrNot[i]){
				answer.push("Usuario "+String(data[i][0])+" subido exitosamente.");
				doQuery(string, data[i]);
			}else{
				answer.push("Usuario "+String(data[i][0])+" ya existe.");
			}
		}
		setTimeout(function(){
			res.send(answer);
		},2500);
	},2500);
});


// ALUMNOS
app.get('/allstudent', function (req, res){
	connection.query('SELECT * FROM alumnos', function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'Usuario no registrado, verifique bien su usuario y contraseña, si el problema persiste, contacte con el administrador!'});
		}else{
			res.send(rows);
		}
	});
});

app.get('/updatestudent', function (req, res){
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
});

app.get('/delstudent', function (req, res){
	matr = req.query.alumno;
	connection.query('DELETE FROM alumnos WHERE alu_matricula = ?', [matr], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
	});
});

app.get('/masivestudent', function (req, res){
	data = JSON.parse(req.query.datos);
	approvedOrNot = [];
	string = 'SELECT * FROM alumnos WHERE alu_matricula = ? LIMIT 1';
	for(i=0;i<data.length;i++){
		doQuery(string, data[i][0]);
	};
	setTimeout(function(){
		answer = [];
		string = 'INSERT INTO alumnos VALUES(?, ?, ?, ?, ?, ?)';
		for(i=0;i<approvedOrNot.length;i++){
			if(!approvedOrNot[i]){
				answer.push("Alumno "+String(data[i][0])+" subido exitosamente.");
				doQuery(string, data[i]);
			}else{
				answer.push("Alumno "+String(data[i][0])+" ya existe.");
			}
		}
		setTimeout(function(){
			res.send(answer);
		},2500);
	},2500);
});

// MATERIAS, PROFESORES Y ALUMNOS
app.get('/allteachandstud', function (req, res){
	profesores = [];
	estudiantes = [];
	connection.query("SELECT pro_nomina, pro_nombre, pro_apellido_paterno, pro_apellido_materno FROM profesores", function (err, rows){
		if(!err && rows.length != 0){
			profesores = rows;
		}
	});
	connection.query("SELECT alu_matricula, alu_nombre, alu_apellido_paterno, alu_apellido_materno FROM alumnos", function (err, rows){
		if(!err && rows.length != 0){
			estudiantes = rows;
		}
	});
	setTimeout(function(){
		data = { teachers: profesores, students: estudiantes };
		res.send(data);
	},1000);
});

app.get('/updatepeoplecourse', function (req, res){
	periodo = req.query.period;
	curso = req.query.course;
	gente = JSON.parse(req.query.people);
	data = [];
	profesores = [];
	alumnos = [];
	for(i=0;i<gente.items.length;i++){
		for(j=0;j<gente.items[i].alumnos.length;j++){
			profesores.push(gente.items[i].profesor);
			alumnos.push(gente.items[i].alumnos[j].alu_matricula);
		}
	}
	connection.query("SELECT mpe_clave_materia_periodo FROM materia_periodo WHERE mpe_clave_periodo = ? AND mpe_clave_materia = ? LIMIT 1", [periodo, curso], function (err, rows){
		if(!err && rows.length != 0){
			clave = rows[0].mpe_clave_materia_periodo;
			connection.query("DELETE FROM alumno_profesor_materia_periodo WHERE apm_clave_materia_periodo = ? AND apm_nomina_profesor NOT IN(?)", [clave, profesores]);
			connection.query("DELETE FROM alumno_profesor_materia_periodo WHERE apm_clave_materia_periodo = ? AND apm_nomina_profesor NOT IN(?)", [clave, alumnos]);
			for(i=0;i<profesores.length;i++){
				(function (pro, alu){
					connection.query("SELECT * FROM alumno_profesor_materia_periodo WHERE apm_clave_materia_periodo = ? AND apm_nomina_profesor = ? AND apm_matricula_alumno = ?", [clave, pro, alu], function (err, rows){
						if(!err && rows.length == 0){
							connection.query("INSERT INTO alumno_profesor_materia_periodo VALUES(?, ?, ?)", [alu, pro, clave]);
						}
					});
				})(profesores[i], alumnos[i]);
			}
		}
	});
	data.push("Información actualizada correctamente");
	setTimeout(function(){
		res.send(data);
	},1000);
});

app.get('/teacherandstudentsfromcourse', function (req, res){
	periodo = req.query.period;
	curso = req.query.course;
	lista = {items:[]};
	connection.query("SELECT mpe_clave_materia_periodo FROM materia_periodo WHERE mpe_clave_periodo = ? AND mpe_clave_materia = ? LIMIT 1", [periodo, curso], function (err, rows){
		clave = rows[0].mpe_clave_materia_periodo;
		connection.query('SELECT * FROM alumno_profesor_materia_periodo WHERE apm_clave_materia_periodo = ? ORDER BY apm_nomina_profesor', [clave], function (err, rows){
			if(!err && rows.length != 0){
				students = [];
				estudiantes = [];
				for(h=0;h<rows.length;h++){
					estudiantes.push(rows[h].apm_matricula_alumno);
				}
				connection.query('SELECT alu_matricula, alu_nombre, alu_apellido_paterno, alu_apellido_materno FROM alumnos WHERE alu_matricula IN(?)', [estudiantes], function (err, rows){
					if(!err && rows.length != 0){
						estudiantes = rows;
					}
				});
				setTimeout(function(){
					for(i=0;i<=rows.length;i++){
						if(i == rows.length){
							lista.items.push({profesor: old_prof, alumnos: students});
							break;
						}
						if(i == 0){
							old_prof = rows[i].apm_nomina_profesor;
						}
						if(old_prof != rows[i].apm_nomina_profesor){
							lista.items.push({profesor: old_prof, alumnos: students});
							old_prof = rows[i].apm_nomina_profesor;
							students = [];
						}
						students.push(estudiantes[i]);
					}
					
				},500)
			}
		});
		setTimeout(function(){
			res.send(lista);
		},1000);
	});
});

// COMPETENCIAS
app.get('/allcompetence', function (req, res){
	connection.query('SELECT * FROM competencias', function (err, rows){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay competencias registradas de momento!'});
		}else{
			res.send(rows);
		}
	});
});

app.get('/updatecompetence', function (req, res){
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
});

app.get('/delcompetence', function (req, res){
	clave = req.query.competencia;
	connection.query('DELETE FROM competencias WHERE com_clave_competencia = ?', [clave], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
	});
});

app.get('/allsubcompetence', function (req, res){
	clave_com = req.query.competencia;
	connection.query('SELECT * FROM subcompetencias WHERE sco_clave_competencia = ?', [clave_com], function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay competencias registradas de momento!'});
		}else{
			res.send(rows);
		}
	});
});

app.get('/updatesubcompetence', function (req, res){
	data = JSON.parse(req.query.subcompetencia);
	trans = req.query.type_trans;
	cla_com = req.query.competencia;
	clave = data.sco_clave_subcompetencia;
	desc = data.sco_descripcion_subcompetencia;
	fijo = data.sco_fijo;
	taxo = data.sco_taxonomia;
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
});

app.get('/delsubcompetence', function (req, res){
	clave = req.query.subcompetencia;
	connection.query('DELETE FROM subcompetencias WHERE sco_clave_subcompetencia = ?', [clave], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Registro borrado exitosamente'];
			res.send(data);
		}
	});
});

app.get('/masivedelsubcompetence', function (req, res){
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
	});
});

app.get('/alllevels', function (req, res){
	clave = req.query.subcompetencia;
	connection.query('SELECT * FROM niveles WHERE niv_clave_subcompetencia = ? ORDER BY niv_nivel', [clave], function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay niveles registrados de momento!'});
		}else{
			res.send(rows);
		}
	});
});

app.get('/updatelevel', function (req, res){
	data = JSON.parse(req.query.nivel);
	trans = req.query.type_trans;
	cla_sco = req.query.subcompetencia;
	nivel = data.niv_nivel;
	desc = data.niv_descripcion;
	connection.query('SELECT * FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_nivel = ? LIMIT 1', [cla_sco, nivel], function (err, rows){
		if(!err && rows.length == 0 && trans == "true"){
			connection.query('INSERT INTO niveles VALUES(?, ?, ?)', [cla_sco, desc, nivel], function (err){
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
});

app.get('/dellevel', function (req, res){
	cla_sco = req.query.subcompetencia;
	nivel = req.query.nivel;
	connection.query('DELETE FROM niveles WHERE niv_clave_subcompetencia = ? AND niv_nivel = ?', [cla_sco, nivel], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Nivel borrado exitosamente'];
			res.send(data);
		}
	});
});

app.get('/masivedellevel', function (req, res){
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
	});
});

app.get('/checklevels', function (req, res){
	data = req.query.competencia;
	flag = false;
	approvedOrNot = [];
	string = 'SELECT * FROM niveles WHERE niv_clave_subcompetencia = ?';
	for(i=0;i<data.length;i++){
		doQuery(string, data[i]);
	};
	setTimeout(function(){
		res.send(approvedOrNot);
	},1000);
});



// MATERIAS
app.get('/allsubjects', function (req, res){
	connection.query('SELECT * FROM materias', function (err, rows, fields){
		if(err || rows.length == 0){
			res.send({ status: 'error', text: 'No hay materias registradas de momento!'});
		}else{
			res.send(rows);
		}
	});
});

app.get('/updatesubject', function (req, res){
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
});

app.get('/delsubject', function (req, res){
	clave = req.query.materia;
	connection.query('DELETE FROM materias WHERE mat_clave_materia = ?', [clave], function (err){
		if(err){
			res.send(err);
		}else{
			data = ['Materia borrada exitosamente'];
			res.send(data);
		}
	});
});


// PERIODO Y MATERIAS
app.get('/allsubjectperiod', function (req, res){
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
});

app.get('/updatesubjectperiod', function (req, res){
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
	},1000);
});



function doQuery (string, arrayValues) {
	connection.query(string, arrayValues, function (err, rows){
		if(!err && rows.length != 0){
			approvedOrNot.push(true);
		}else{
			approvedOrNot.push(false);
		}
	});
}





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
	if(typeof(token) != 'undefined' && token != 'null'){
		decoded = jwt.decode(token, app.get('jwtTokenSecret'));
		if (decoded.exp <= Date.now()) {
			//Access token has expired
			vigent = false;
		}
		if (decoded.exp >= Date.now()) {
			//Access token still vigent
			vigent = true;
		}
	}else{
		//Usuario no identificado
		vigent = false;
	}
	return vigent;
}


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


function whoAreYouName(token, callback){
	decoded = jwt.decode(token, app.get('jwtTokenSecret'));
	user = decoded.iss;
	name = '';
	connection.query('SELECT * FROM alumnos WHERE alu_matricula = ? LIMIT 1', [user], function (err, rows) {
		if(!err && rows.length != 0){
			name = rows[0].alu_nombre + ' ' + rows[0].alu_apellido_paterno + ' ' + rows[0].alu_apellido_materno;
			callback(name);
		}
	});
	connection.query('SELECT * FROM profesores WHERE pro_nomina = ? LIMIT 1', [user], function (err, rows) {
		if(!err && rows.length != 0){
			name = rows[0].pro_nombre + ' ' + rows[0].pro_apellido_paterno + ' ' + rows[0].pro_apellido_materno;
			callback(name);
		}
	});
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


//Funcion que obtiene el token de la cookie
function getCookie(name, cookie) {
	re = new RegExp(name + "=([^;]+)");
	value = re.exec(cookie);
	return (value != null) ? unescape(value[1]) : null;
}