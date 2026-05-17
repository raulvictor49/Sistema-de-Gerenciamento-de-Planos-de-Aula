const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); // Permite que o frontend se comunique com o backend
app.use(express.json()); // Permite que a API entenda dados em formato JSON

// Rota de teste
app.get('/api', (req, res) => {
  res.json({ mensagem: 'API do Sistema de Planos de Aula rodando com sucesso! 🚀' });
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});