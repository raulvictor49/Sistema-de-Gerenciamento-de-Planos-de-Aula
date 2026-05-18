const pool = require('../config/db');
const { z } = require('zod');

const planoSchema = z.object({
  titulo: z.string({ required_error: "O título é obrigatório" })
           .min(3, "O título deve ter pelo menos 3 caracteres"),
  disciplina: z.string({ required_error: "A disciplina é obrigatória" })
               .min(2, "A disciplina deve ter pelo menos 2 caracteres"),
  objetivo: z.string({ required_error: "O objetivo é obrigatório" })
             .min(5, "O objetivo deve ter pelo menos 5 caracteres"),
  ementa: z.string({ required_error: "A ementa é obrigatória" })
           .min(5, "A ementa deve ter pelo menos 5 caracteres"),
  conteudos: z.string({ required_error: "Os conteúdos programáticos são obrigatórios" })
              .min(5, "Os conteúdos devem ter pelo menos 5 caracteres"),
  data_prevista: z.string().nullable().optional().or(z.literal('')), // Aceita string de data, nulo ou vazio
  recursos_apoio: z.string().nullable().optional(),
  tags: z.string().nullable().optional()
});

// Cria plano de aula vazio (POST)
const criarPlano = async (req, res) => {
  // Deixa o Zod validar os dados que vieram do frontend
  const validacao = planoSchema.safeParse(req.body);

  // Se a validação falhar, pegamos os erros e devolvemos um HTTP 400 amigável
  if (!validacao.success) {
    const mensagensDeErro = validacao.error.errors.map(err => err.message).join(' | ');
    return res.status(400).json({ erro: mensagensDeErro });
  }

  // Se passou, usa-se os dados higienizados e validados pelo Zod
  const { titulo, objetivo, ementa, data_prevista, disciplina, conteudos, recursos_apoio, tags } = validacao.data;

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
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Listar planos de aula com filtros, busca e paginação (GET)
const listarPlanos = async (req, res) => {
  try {
    const { page = 1, limit = 5, disciplina, tag, data_prevista, busca, ordenarPor } = req.query;
    
    const limite = parseInt(limit);
    const offset = (parseInt(page) - 1) * limite;
    
    let queryText = 'SELECT * FROM planos_aula WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM planos_aula WHERE 1=1';
    
    const values = [];
    let placeholderIndex = 1;

    if (disciplina) {
      const filtro = ` AND disciplina ILIKE $${placeholderIndex}`;
      queryText += filtro;
      countQuery += filtro;
      values.push(`%${disciplina}%`);
      placeholderIndex++;
    }

    if (tag) {
      const filtro = ` AND tags ILIKE $${placeholderIndex}`;
      queryText += filtro;
      countQuery += filtro;
      values.push(`%${tag}%`);
      placeholderIndex++;
    }

    if (data_prevista) {
      const filtro = ` AND data_prevista = $${placeholderIndex}`;
      queryText += filtro;
      countQuery += filtro;
      values.push(data_prevista);
      placeholderIndex++;
    }

    if (busca) {
      const filtro = ` AND titulo ILIKE $${placeholderIndex}`;
      queryText += filtro;
      countQuery += filtro;
      values.push(`%${busca}%`);
      placeholderIndex++;
    }

    if (ordenarPor === 'titulo') {
      queryText += ' ORDER BY titulo ASC';
    } else {
      queryText += ' ORDER BY criado_em DESC';
    }

    const totalResultado = await pool.query(countQuery, values);
    const totalItens = parseInt(totalResultado.rows[0].count);

    queryText += ` LIMIT $${placeholderIndex} OFFSET $${placeholderIndex + 1}`;
    values.push(limite, offset);

    const resultado = await pool.query(queryText, values);

    return res.status(200).json({
      dados: resultado.rows,
      paginacao: {
        totalItens,
        paginaAtual: parseInt(page),
        totalPaginas: Math.ceil(totalItens / limite),
        limite: limite
      }
    });

  } catch (err) {
    console.error('Erro ao buscar planos de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor ao buscar os planos.' });
  }
};

// Atualizar planos de aula (PUT)
const atualizarPlano = async (req, res) => {
  const { id } = req.params;

  // Validação também na edição para garantir consistência dos dados
  const validacao = planoSchema.safeParse(req.body);
  if (!validacao.success) {
    const mensagensDeErro = validacao.error.errors.map(err => err.message).join(' | ');
    return res.status(400).json({ erro: mensajesDeErro });
  }

  const { titulo, objetivo, ementa, data_prevista, disciplina, conteudos, recursos_apoio, tags } = validacao.data;

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

    return res.status(200).json({ mensagem: 'Plano de aula atualizado com sucesso!', plano: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar plano de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Deletar plano de aula (DELETE)
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
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = {
  criarPlano,
  listarPlanos,
  atualizarPlano,
  deletarPlano,
};