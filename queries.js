var promise = require('bluebird');

var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://postgres:pedro123@localhost:5432/real';
var db = pgp(connectionString);

// add query functions

function obtenerCarreras(req, res, next) {
    db
        .any('select * from carreras')
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Carreras Obtenidas!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}


function obtenerCasosLimite(req, res, next) {
    let area = req.params.area
    let limite = req.params.limite
    db
        .any(`select casos.idcaso,casos.nombre as Casonombre,enlaces.nombre as enlace,areas.nombre as area,carreras.nombre as carrera,casos.estado as estado
        from casos,enlaces,areas,carreras
        where casos.idenlace = enlaces.idenlace and casos.idarea=areas.idarea and carreras.idcarrera=areas.idcarrera and casos.estado = 'V' and areas.idarea = ${area}
        order by random() limit ${limite}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Casos Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function ObtenerAreasxEstudianteRep(req, res, next) {
    let codEst = req.params.codEst
    let carrera = req.params.carrera
    let estado = req.params.estado
    db
        .any(`select areas.idarea, areas.nombre as Area,carreras.nombre as Carrera
        from areas,carreras
        where carreras.idcarrera = areas.idcarrera and carreras.idcarrera = ${carrera} and areas.idarea != (
        select areas.idarea
        from personas,estudiantes,carreras,casos,areas,sorteos,enlaces,defensas
        where personas.idpersona = estudiantes.idpersona and carreras.idcarrera = areas.idcarrera and casos.idarea = areas.idarea and sorteos.idcaso = casos.idcaso
        and personas.idpersona = sorteos.idpersona and enlaces.idenlace = casos.idenlace and sorteos.idsorteo = defensas.idsorteo 
        and estudiantes.registro = '${codEst}' and sorteos.estado = '${estado}')`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Casos Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}


function obtenerCasos(req, res, next) {
    let filtro = req.params.filtro
    db
        .any(`select casos.idcaso,casos.nombre as casoNombre,enlaces.nombre as Enlace,areas.nombre as Area,carreras.nombre as Carrera,casos.estado as Estado 
        from casos,enlaces,areas,carreras
        where casos.idenlace = enlaces.idenlace and casos.idarea=areas.idarea 
        and carreras.idcarrera=areas.idcarrera and casos.estado = 'V' 
        and carreras.idCarrera = ${filtro}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Casos Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}



function registrarPersonas(req, res, next) {
    db.none('insert into personas(nombre,apaterno,amaterno,usuario) ' +
            ' values(${nombre}, ${apaterno}, ${amaterno}, ${usuario})',
            req.body)
        .then(function () {
            res.status(200)
                .json({
                    status: 'Exito',
                    message: 'Insertado Correctamente'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}



//-----------------para mostrar los estudiates desde la base de datos aqui esta la consulta puto

function obtenerEstudiantes(req, res, next) {
    let filtro = req.params.filtro
    db.any(`select personas.idpersona,personas.nombre as Nombres,apaterno,amaterno,registro,carreras.nombre as Carrera
	from personas,carreras,estudiantes
	where not exists(select 1 from sorteos where sorteos.idpersona = personas.idpersona and sorteos.estado = 'INTERNA') 
	and personas.idpersona = estudiantes.idpersona and carreras.idcarrera = personas.idcarrera and carreras.idcarrera = ${filtro}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Estudiantes encontrado!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function obtenerAprobados(req, res, next) {
    let filtro = req.params.filtro
    db.any(`select casos.idcaso,defensas.iddefensa,personas.nombre as Nombres,personas.apaterno,personas.amaterno,estudiantes.registro,carreras.nombre as carrera,
    areas.nombre as area,casos.nombre as caso
        from defensas,personas,estudiantes,carreras,areas,casos,sorteos
        where personas.idpersona = estudiantes.idpersona and personas.idcarrera = carreras.idcarrera and areas.idcarrera = carreras.idcarrera
        and casos.idarea = areas.idarea and sorteos.idsorteo = defensas.idsorteo and sorteos.idpersona = personas.idpersona and casos.idcaso = sorteos.idcaso
        and carreras.idcarrera = ${filtro} and defensas.nota = 'A' and not EXISTS (
    select 1 from sorteos where sorteos.idpersona = personas.idpersona and sorteos.estado = 'EXTERNA')`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Estudiantes encontrado!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function obtenerReprobados(req, res, next) {
    let filtro = req.params.filtro
    db.any(`select casos.idcaso,personas.idpersona,personas.nombre as Nombres, apaterno,amaterno,registro,carreras.nombre as Carrera,casos.nombre as caso
    from defensas,personas,estudiantes,carreras,areas,casos,sorteos
    where personas.idpersona = estudiantes.idpersona and personas.idcarrera = carreras.idcarrera and areas.idcarrera = carreras.idcarrera
    and casos.idarea = areas.idarea and sorteos.idsorteo = defensas.idsorteo and sorteos.idpersona = personas.idpersona and casos.idcaso = sorteos.idcaso
    and carreras.idcarrera = ${filtro} and not EXISTS (
    select 1 from sorteos where sorteos.idpersona = personas.idpersona and sorteos.estado = 'REPECHAJE')
    and EXISTS (
    select 1 from sorteos, defensas where sorteos.idpersona = personas.idpersona and defensas.idsorteo = sorteos.idsorteo and defensas.nota = 'R')`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Estudiantes encontrados!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}
//------aqui termia-----------------------

function obtenerRoles(req, res, next) {
    db
        .any('select * from roles')
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Roles Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function obtenerDetalles(req, res, next) {
    let id = req.params.id;
    let estado = req.params.estado;
    db.one(`select iddefensa,areas.idarea, personas.nombre as Nombres, personas.apaterno, personas.amaterno, registro as Registro, carreras.nombre as Carrera,casos.nombre as Caso,areas.nombre as Area,enlaces.nombre as Enlace 
    from personas,estudiantes,carreras,casos,areas,sorteos,enlaces,defensas
            where personas.idpersona = estudiantes.idpersona and carreras.idcarrera = areas.idcarrera and casos.idarea = areas.idarea and sorteos.idcaso = casos.idcaso
            and personas.idpersona = sorteos.idpersona and enlaces.idenlace = casos.idenlace and sorteos.idsorteo = defensas.idsorteo and estudiantes.registro = '${id}' and sorteos.estado = '${estado}'`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Datos Obtenidos'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function obtenerSorteos(req, res, next) {
    let filtro = req.params.filtro
    let estado = req.params.estado
    db.any(`select defensas.estado,iddefensa, areas.idarea,personas.nombre as Nombres, personas.apaterno, personas.amaterno, registro as Registro, carreras.nombre as Carrera,casos.nombre as Caso,areas.nombre as Area,enlaces.nombre as Enlace
    from personas,estudiantes,carreras,casos,areas,sorteos,enlaces,defensas
    where personas.idpersona = estudiantes.idpersona and carreras.idcarrera = areas.idcarrera and casos.idarea = areas.idarea and sorteos.idcaso=casos.idcaso
    and personas.idpersona = sorteos.idpersona and enlaces.idenlace = casos.idenlace and sorteos.idsorteo = defensas.idsorteo and carreras.idcarrera = ${filtro} and  sorteos.estado = '${estado}'`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Sorteos encontrados!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function InsertarSorteo(req, res, next) {
    db.none('insert into sorteos(idcuenta,idcaso,idpersona,fecha,hora,estado)' +
            'values(${idcuenta}, ${idcaso}, ${idpersona}, ${fecha},${hora},${estado})',
            req.body)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Insertado Correcatemente'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}


//-----------------------------

function obtenerSorteosAll(req, res, next) {
    db.any('select personas.nombre as Nombres, personas.apaterno, personas.amaterno, registro as Registro, carreras.nombre as Carrera,casos.nombre as Caso,areas.nombre as Area,enlaces.nombre as Enlace ' +
            'from personas,estudiantes,carreras,casos,areas,sorteos,enlaces ' +
            'where personas.idpersona = estudiantes.idpersona and carreras.idcarrera = areas.idcarrera and casos.idarea = areas.idarea and sorteos.idcaso = casos.idcaso ' +
            `and personas.idpersona = sorteos.idpersona and enlaces.idenlace = casos.idenlace`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Sorteos encontrados!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function obtenerTribunales(req, res, next) {
    let idarea = req.params.idarea
    let idhora = req.params.idhora
    let fecha = req.params.fecha
    db.any(`SELECT * 
    from personas per join tribunales tr on tr.idpersona = per.idpersona
    join tipos tp on tp.idpersona = tr.idpersona
    WHERE idarea = ${idarea} and not EXISTS(
        SELECT * from defareas df
        WHERE df.idtipo = tp.idtipo AND idhora = ${idhora} and fecha = '${fecha}' 
    )`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Sorteos encontrados!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function InsertarDef(req, res, next) {
    db.none('INSERT INTO defareas(iddefensa,idtipo,fecha,idhora,idlab)' +
            'values(${iddefensa}, ${idtipo},${fecha},${idhora},${idlab})',
            req.body)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Insertado Correcatemente'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function AcutalizarDef(req, res, next) {
    db.none('UPDATE defensas set fecha = $1 , idhora = $2, idlab  = $3 where iddefensa = $4',
            [req.body.fecha, req.body.idhora, req.body.idlab, parseInt(req.params.iddefensa)])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Exito al actualizar'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function actualizarNota(req, res, next) {
    db.none('update defensas set nota = $1 where iddefensa = $2',
            [req.body.nota, parseInt(req.params.iddefensa)])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated puppy'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

//----------------------------------------

function obtenerNotas(req, res, next) {
    let filtro = req.params.filtro
    let tipo = req.params.tipo
    db.any(`select defensas.iddefensa, personas.idpersona,personas.nombre as Nombres,personas.apaterno,personas.amaterno,estudiantes.registro,carreras.nombre as Carrera,areas.nombre as Area,casos.nombre as Caso,defensas.nota
    from defensas,personas,estudiantes,carreras,areas,casos,sorteos
    where personas.idpersona = estudiantes.idpersona and personas.idcarrera = carreras.idcarrera and areas.idcarrera = carreras.idcarrera
    and casos.idarea = areas.idarea and sorteos.idsorteo = defensas.idsorteo and sorteos.idpersona = personas.idpersona and casos.idcaso = sorteos.idcaso
    and carreras.idcarrera = ${filtro} and defensas.idtdef = ${tipo}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Estudiantes encontrados!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function obtenerAreasxCarrera(req, res, next) {
    let idcarrera = req.params.idcarrera
    db.any(`select  areas.idarea,areas.nombre
    from carreras,areas
    where carreras.idcarrera = areas.idcarrera and carreras.idcarrera ='${idcarrera}'`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Areas encontradas!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}
//-------------------------------
function obtenerHora(req, res, next) {
    db.any('select  * from defhora')
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Horas Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}


//------------------------------------

function obtenerLab(req, res, next) {
    db.any('SELECT * from deflab')
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Labs Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}
//----------------------------------------
function obetenerDef(req, res, next) {
    let def = req.params.def
    db.any(`SELECT per.nombre,per.apaterno,per.amaterno,df.fecha,dfh.hora,dfl.lab
    from personas per join tribunales tr on tr.idpersona = per.idpersona join tipos tp on tp.idpersona = tr.idpersona 
		join defareas df on df.idtipo = tp.idtipo join deflab dfl on dfl.idlab = df.idlab join defhora dfh on dfh.idhora = df.idhora 
		where df.iddefensa = ${def}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Tribunales encontrados!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}
//-----------------------------

function obtenerCasosR(req, res, next) {
    let filtro = req.params.filtro
    let idcaso = req.params.idcaso
    db.any(`select casos.idcaso,casos.nombre as casoNombre,enlaces.nombre as Enlace,areas.nombre as Area,carreras.nombre as Carrera,casos.estado as Estado 
    from casos,enlaces,areas,carreras
    where casos.idenlace = enlaces.idenlace and casos.idarea=areas.idarea 
    and carreras.idcarrera=areas.idcarrera and casos.estado = 'V' 
    and carreras.idCarrera =${filtro} and casos.idcaso != ${idcaso}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Sorteos encontrados!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function obtenerCasosE(req, res, next) {
    let filtro = req.params.filtro
    let idcaso = req.params.idcaso
    db.any(`select casos.idcaso,casos.nombre as casoNombre,enlaces.nombre as Enlace,areas.nombre as Area,carreras.nombre as Carrera,casos.estado as Estado 
    from casos,enlaces,areas,carreras
    where casos.idenlace = enlaces.idenlace and casos.idarea=areas.idarea 
    and carreras.idcarrera=areas.idcarrera and casos.estado = 'V' 
    and carreras.idCarrera =${filtro} and casos.idcaso != ${idcaso}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Sorteos encontrados!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}
//----------------------------------------
function obtenerTipDef(req, res, next) {
    db.any('SELECT * FROM tipodef')
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Labs Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function totalCasos(req, res, next) {
    db.any('select count(*) as totalCasos from casos')
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Total Casos Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function totalCasosSinAsig(req, res, next) {
    let filtro = req.params.filtro
    db.any(`select count(*) as casossinasig 
    from casos,carreras,areas,enlaces
    where areas.idcarrera = carreras.idcarrera and areas.idarea = casos.idarea and enlaces.idenlace = casos.idenlace 
    and estado = 'V' and carreras.idCarrera = ${filtro}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Total Casos Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function totalCasosAsig(req, res, next) {
    let filtro = req.params.filtro
    db.any(`select count(*) as casosAsig 
    from casos,carreras,areas,enlaces
    where areas.idcarrera = carreras.idcarrera and areas.idarea = casos.idarea and enlaces.idenlace = casos.idenlace 
    and estado = 'F' and carreras.idCarrera = ${filtro}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Total Casos Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function totalCasosxCarrera(req, res, next) {
    let filtro = req.params.filtro
    db
        .any(`select count(*) 
        from casos,enlaces,areas,carreras
        where casos.idenlace = enlaces.idenlace and casos.idarea=areas.idarea 
        and carreras.idcarrera=areas.idcarrera and carreras.idCarrera = ${filtro}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Casos Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}

function totalCasosxArea(req, res, next) {
    let idarea = req.params.idarea
    db
        .any(`select count(*) as cantArea
        from casos,areas,carreras,enlaces
        where carreras.idcarrera = areas.idcarrera and casos.idarea = areas.idarea 
        and enlaces.idenlace = casos.idenlace and casos.estado = 'V' and areas.idarea = ${idarea}`)
        .then(function (data) {
            res.status(200).json({
                status: 'success',
                data: data,
                message: 'Casos Obtenidos!'
            });
        })
        .catch(function (err) {
            return next(err);
        });
}


//----------------------------------------

module.exports = {
    // getAllPuppies: getAllPuppies,
    // getSinglePuppy: getSinglePuppy,
    // createPuppy: createPuppy,
    // updatePuppy: updatePuppy,
    // removePuppy: removePuppy
    obtenerCarreras,
    obtenerCasos,
    registrarPersonas,
    obtenerEstudiantes,
    obtenerRoles,
    InsertarSorteo,
    obtenerDetalles,
    obtenerSorteos,
    obtenerSorteosAll,
    obtenerTribunales,
    InsertarDef,
    AcutalizarDef,
    obtenerNotas,
    actualizarNota,
    obtenerAprobados,
    obtenerAreasxCarrera,
    obtenerHora,
    obtenerLab,
    obetenerDef,
    obtenerReprobados,
    obtenerCasosR,
    obtenerCasosE,
    obtenerTipDef,
    obtenerCasosLimite,
    ObtenerAreasxEstudianteRep,
    totalCasos,
    totalCasosSinAsig,
    totalCasosAsig,
    totalCasosxCarrera,
    totalCasosxArea
};