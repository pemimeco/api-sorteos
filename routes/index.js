var express = require('express');
var router = express.Router();

var db = require('../queries');

// router.get('/api/puppies', db.getAllPuppies);
// router.get('/api/puppies/:id', db.getSinglePuppy);
// router.post('/api/puppies', db.createPuppy);
// router.put('/api/puppies/:id', db.updatePuppy);
// router.delete('/api/puppies/:id', db.removePuppy);
router.get('/api/obtenerCarreras', db.obtenerCarreras);
router.get('/api/totalCasos', db.totalCasos);
router.get('/api/totalCasosSinAsig/:filtro', db.totalCasosSinAsig);
router.get('/api/totalCasosAsig/:filtro', db.totalCasosAsig);
router.get('/api/totalCasosxCarrera/:filtro', db.totalCasosxCarrera);
router.get('/api/totalCasosxArea/:idarea', db.totalCasosxArea);
router.get('/api/obtenerCasos/:filtro', db.obtenerCasos);
router.get('/api/obtenerEstudiantes/:filtro', db.obtenerEstudiantes);
router.get('/api/obtenerAprobados/:filtro', db.obtenerAprobados);
router.get('/api/obtenerReprobados/:filtro', db.obtenerReprobados);
router.get('/api/obtenerRoles', db.obtenerRoles);
router.get('/api/obtenerDetalles/:id/:estado', db.obtenerDetalles);
router.get('/api/obtenerSorteos/:filtro/:estado', db.obtenerSorteos);
router.get('/api/obtenerSorteosAll', db.obtenerSorteosAll);
router.get('/api/obtenerTribunales/:idarea/:idhora/:fecha', db.obtenerTribunales);
router.get('/api/obtenerNotas/:filtro/:tipo', db.obtenerNotas);
router.get('/api/obtenerAreasxCarrera/:idcarrera', db.obtenerAreasxCarrera);
router.get('/api/obtenerHora', db.obtenerHora);
router.get('/api/obtenerLab', db.obtenerLab);
router.get('/api/obetenerDef/:def', db.obetenerDef);
router.get('/api/obtenerCasosR/:filtro/:idcaso', db.obtenerCasosR);
router.get('/api/obtenerCasosE/:filtro/:idcaso', db.obtenerCasosE);
router.get('/api/tipodef', db.obtenerTipDef);
router.get('/api/obtenerCasosLimite/:area/:limite', db.obtenerCasosLimite);
router.get('/api/ObtenerAreasxEstudianteRep/:codEst/:carrera/:estado', db.ObtenerAreasxEstudianteRep);


//--------------------------------------------

router.post('/api/registrarPersonas', db.registrarPersonas);
router.post('/api/InsertarDef', db.InsertarDef);
router.post('/api/InsertarSorteo', db.InsertarSorteo);
// router.post('/api/registrarJefe', db.registrarJefe);

router.put('/api/AcutalizarDef/:iddefensa', db.AcutalizarDef);
router.put('/api/actualizarNota/:iddefensa', db.actualizarNota);


module.exports = router;