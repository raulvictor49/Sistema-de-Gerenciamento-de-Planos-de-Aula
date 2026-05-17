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

// Função para atualizar um plano de aula existente (PUT)
const atualizarPlano = async (req, res) => {
  const { id } = req.params; // Pega o ID vindo na URL (ex: /api/planos/1)
  const { titulo, tema, objetivos, conteudo, metodologia } = req.body;

  if (!titulo || !tema || !objetivos || !conteudo) {
    return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    const queryText = `
      UPDATE planos_aula
      SET titulo = $1, tema = $2, objetivos = $3, conteudo = $4, metodologia = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [titulo, tema, objetivos, conteudo, metodologia, id];
    const resultado = await pool.query(queryText, values);

    // Se o resultado voltar vazio, significa que o ID não existe no banco
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Plano de aula não encontrado.' });
    }

    return res.status(200).json({
      mensagem: 'Plano de aula atualizado com sucesso! 🔄',
      plano: resultado.rows[0]
    });
  } catch (err) {
    console.error('❌ Erro ao atualizar plano de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao atualizar o plano.' });
  }
};

// Função para deletar um plano de aula (DELETE)
const deletarPlano = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = 'DELETE FROM planos_aula WHERE id = $1 RETURNING *;';
    const resultado = await pool.query(queryText, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Plano de aula não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Plano de aula excluído com sucesso! 🗑️' });
  } catch (err) {
    console.error('❌ Erro ao deletar plano de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao deletar o plano.' });
  }
};

module.exports = {
  criarPlano,
  listarPlanos,
  atualizarPlano,
  deletarPlano,
};