const pool = require('../config/db');

// Função para criar a tabela de planos de aula no banco de dados
const criarTabelaPlanos = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS planos_aula (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      tema VARCHAR(255) NOT NULL,
      objetivos TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      metodologia TEXT,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(queryText);
    console.log('📋 Tabela "planos_aula" verificada/criada com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar a tabela "planos_aula":', err.stack);
  }
};

// Executa a função assim que o modelo for importado
criarTabelaPlanos();

module.exports = {
  // Aqui futuramente será colocada as funções de Banco (buscar todos, salvar, etc.)
};