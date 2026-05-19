const pool = require('../config/db');
const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa a SDK do Gemini utilizando a chave guardada nas variaveis de ambiente
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Schema de validacao para criacao e edicao de planos
const planoSchema = z.object({
  titulo: z.string({ required_error: "O titulo e obrigatorio" })
           .min(3, "O titulo deve ter pelo menos 3 caracteres"),
  disciplina: z.string({ required_error: "A disciplina e obrigatoria" })
               .min(2, "A disciplina deve ter pelo menos 2 caracteres"),
  objetivo: z.string({ required_error: "O objetivo e obrigatorio" })
             .min(5, "O objetivo deve ter pelo menos 5 caracteres"),
  ementa: z.string({ required_error: "A ementa e obrigatoria" })
           .min(5, "A ementa deve ter pelo menos 5 caracteres"),
  conteudos: z.string({ required_error: "Os conteudos programaticos sao obrigatorios" })
              .min(5, "Os conteudos devem ter pelo menos 5 caracteres"),
  data_prevista: z.string().nullable().optional().or(z.literal('')),
  recursos_apoio: z.string().nullable().optional(),
  tags: z.string().nullable().optional()
});

// Schema de validacao para a requisicao de IA
const iaSchema = z.object({
  titulo: z.string({ required_error: "O titulo e necessario para gerar as recomendacoes" }).min(3),
  disciplina: z.string({ required_error: "A disciplina e necessaria para gerar as recomendacoes" }).min(2),
  ementa: z.string({ required_error: "A ementa e necessaria para gerar as recomendacoes" }).min(5)
});

// FUNCAO: Gera recomendacoes utilizando IA (GEMINI)
const gerarPlanoIA = async (req, res) => {
  const validacao = iaSchema.safeParse(req.body);
  
  if (!validacao.success) {
    const mensagensDeErro = validacao.error.issues.map(err => err.message).join(' | ');
    return res.status(400).json({ erro: mensagensDeErro });
  }

  if (!genAI) {
    return res.status(500).json({ erro: "Configuracao de IA ausente. Verifique a GEMINI_API_KEY" });
  }

  const { titulo, disciplina, ementa } = validacao.data;

  try {
    // responseMimeType forca retorno em JSON puro, eliminando markdown na raiz
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `Voce e um assistente pedagogico. Com base na disciplina "${disciplina}", no titulo de aula "${titulo}" e na ementa/resumo providenciada: "${ementa}", gere recomendacoes complementares para este plano de aula.
    Sua resposta deve ser estritamente um objeto JSON valido, sem qualquer formatacao markdown adicional (nao inclua as tres crases ou a palavra json).
    O formato do objeto retornado deve seguir exatamente esta estrutura de chaves:
    {
      "topicos_relacionados": "Lista textual contendo os topicos relacionados para a aula",
      "conteudos_complementares": "Sugestoes de conteudos complementares e materiais de apoio",
      "tags_recomendadas": "Tres tags recomendadas para o plano, separadas por virgula"
    }`;

    // Timeout de 10s para evitar requisicoes penduradas
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout da IA")), 10000)
    );

    const resultadoIA = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    const textoResposta = resultadoIA.response.text();

    // Extracao robusta do JSON, independente de texto antes/depois das crases
    let textoLimpo = textoResposta.trim();
    const match = textoLimpo.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (match) {
      textoLimpo = match[1].trim();
    }

    const dadosRecomendados = JSON.parse(textoLimpo);

    // Validacao estrutural do JSON retornado pela IA
    const chavesEsperadas = ['topicos_relacionados', 'conteudos_complementares', 'tags_recomendadas'];
    const valido = chavesEsperadas.every(c => Object.keys(dadosRecomendados).includes(c));

    if (!valido) {
      return res.status(500).json({ erro: "A IA retornou uma estrutura inesperada." });
    }

    return res.status(200).json(dadosRecomendados);

  } catch (err) {
    console.error("Erro na geracao de recomendacoes via IA:", err.stack);
    return res.status(500).json({ erro: "Falha ao processar as recomendacoes com Inteligencia Artificial" });
  }
};

// Criar plano de aula (POST)
const criarPlano = async (req, res) => {
  const validacao = planoSchema.safeParse(req.body);

  if (!validacao.success) {
    const mensagensDeErro = validacao.error.issues.map(err => err.message).join(' | ');
    return res.status(400).json({ erro: mensagensDeErro });
  }

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
      mensagem: 'Plano de aula criado com sucesso.',
      plano: resultado.rows[0]
    });
  } catch (err) {
    console.error('Erro ao salvar plano de aula:', err.stack);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Listar planos de aula com filtros, busca e paginacao (GET)
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

// Atualizar plano de aula (PUT)
const atualizarPlano = async (req, res) => {
  const { id } = req.params;
  const validacao = planoSchema.safeParse(req.body);

  if (!validacao.success) {
    const mensagensDeErro = validacao.error.issues.map(err => err.message).join(' | ');
    return res.status(400).json({ erro: mensagensDeErro });
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

    return res.status(200).json({ mensagem: 'Plano de aula atualizado com sucesso.', plano: resultado.rows[0] });
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

    return res.status(200).json({ mensagem: 'Plano de aula excluído com sucesso.' });
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
  gerarPlanoIA,
};