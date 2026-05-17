const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoController');

// Define a rota para criar um plano (POST http://localhost:3000/api/planos)
router.post('/', planoController.criarPlano);

// Define a rota para listar os planos (GET http://localhost:3000/api/planos)
router.get('/', planoController.listarPlanos);

module.exports = router;