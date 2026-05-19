const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoController');

// Rotas do CRUD tradicional
router.post('/', planoController.criarPlano);
router.get('/', planoController.listarPlanos);
router.put('/:id', planoController.atualizarPlano);
router.delete('/:id', planoController.deletarPlano);

// Rota para integracao com a Inteligencia Artificial
router.post('/gerar-ia', planoController.gerarPlanoIA);

module.exports = router;