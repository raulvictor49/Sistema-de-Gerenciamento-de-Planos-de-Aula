const pool = require('../config/db');

const criarTabela = async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS planos_aula;');

    const queryText = `
      CREATE TABLE planos_aula (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        objetivo TEXT NOT NULL,
        ementa TEXT NOT NULL,
        data_prevista DATE,
        disciplina VARCHAR(100) NOT NULL,
        conteudos TEXT NOT NULL,
        recursos_apoio TEXT,
        tags TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(queryText);
    console.log('Tabela planos_aula criada com sucesso!');
  } catch (err) {
    console.error('Erro ao criar a tabela:', err.stack);
  }
};

criarTabela();