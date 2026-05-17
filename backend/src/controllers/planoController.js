const pool = require('../config/db');

// Função para criar um novo plano de aula
const criarPlano = async (req, res) => {
  // Pega os dados que o frontend enviará no corpo (body) da requisição
  const { titulo, tema, objetivos, conteudo, metodologia } = req.body;

  // Validação básica para não salvar campos obrigatórios vazios
  if (!titulo || !tema || !objetivos || !conteudo) {
    return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    const queryText = `
      INSERT INTO planos_aula (titulo, tema, objetivos, conteudo, metodologia)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [titulo, tema, objetivos, conteudo, metodologia];

    const resultado = await pool.query(queryText, values);
    
    // Retorna o plano de aula que acabou de ser criado com o ID do banco
    return res.status(201).json({
      mensagem: 'Plano de aula criado com sucesso! 📝',
      plano: resultado.rows[0]
    });
  } catch (err) {
    console.error('❌ Erro ao salvar plano de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao salvar o plano.' });
  }
};

// Função para listar todos os planos de aula (GET)
const listarPlanos = async (req, res) => {
  try {
    // Busca todos os planos, ordenando do mais recente para o mais antigo
    const queryText = 'SELECT * FROM planos_aula ORDER BY criado_em DESC;';
    const resultado = await pool.query(queryText);
    
    // Retorna a lista de planos encontrados (se estiver vazio, retorna uma lista vazia)
    return res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('❌ Erro ao buscar planos de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao buscar os planos.' });
  }
};

module.exports = {
  criarPlano,
  listarPlanos,
};