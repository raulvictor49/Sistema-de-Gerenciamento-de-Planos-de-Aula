const pool = require('../config/db');

// Criar plano de aulas (POST)
const criarPlano = async (req, res) => {
  // Pegando os campos enviados pelo frontend
  const { titulo, objetivo, ementa, data_prevista, disciplina, conteudos, recursos_apoio, tags } = req.body;

  // Validação dos campos
  if (!titulo || !objetivo || !ementa || !disciplina || !conteudos) {
    return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios (Título, Objetivo, Ementa, Disciplina e Conteúdos).' });
  }

  try {
    const queryText = `
      INSERT INTO planos_aula (titulo, objetivo, ementa, data_prevista, disciplina, conteudos, recursos_apoio, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [titulo, objetivo, ementa, data_prevista || null, disciplina, conteudos, recursos_apoio, tags];
    
    const resultado = await pool.query(queryText, values);
    
    return res.status(201).json({
      mensagem: 'Plano de aula criado com sucesso!',
      plano: resultado.rows[0]
    });
  } catch (err) {
    console.error('Erro ao salvar plano de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao salvar o plano.' });
  }
};

// Listar plano de aulas (GET)
const listarPlanos = async (req, res) => {
  try {
    // Por enquanto, traz tudo ordenado pelo mais recente (depois adicionar filtros e paginação)
    const queryText = 'SELECT * FROM planos_aula ORDER BY criado_em DESC;';
    const resultado = await pool.query(queryText);
    return res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar planos de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao buscar os planos.' });
  }
};

// Atualizar planos de aula (PUT)
const atualizarPlano = async (req, res) => {
  const { id } = req.params;
  const { titulo, objetivo, ementa, data_prevista, disciplina, conteudos, recursos_apoio, tags } = req.body;

  if (!titulo || !objetivo || !ementa || !disciplina || !conteudos) {
    return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    const queryText = `
      UPDATE planos_aula
      SET titulo = $1, objetivo = $2, ementa = $3, data_prevista = $4, disciplina = $5, conteudos = $6, recursos_apoio = $7, tags = $8
      WHERE id = $9
      RETURNING *;
    `;
    const values = [titulo, objetivo, ementa, data_prevista || null, disciplina, conteudos, recursos_apoio, tags, id];
    
    const resultado = await pool.query(queryText, values);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Plano de aula não encontrado.' });
    }

    return res.status(200).json({
      mensagem: 'Plano de aula atualizado com sucesso!',
      plano: resultado.rows[0]
    });
  } catch (err) {
    console.error('Erro ao atualizar plano de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao atualizar o plano.' });
  }
};

// Deletar planos de aula (DELETE)
const deletarPlano = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = 'DELETE FROM planos_aula WHERE id = $1 RETURNING *;';
    const resultado = await pool.query(queryText, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Plano de aula não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Plano de aula excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao deletar plano de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao deletar o plano.' });
  }
};

module.exports = {
  criarPlano,
  listarPlanos,
  atualizarPlano,
  deletarPlano,
};