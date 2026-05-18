import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // Dados dos planos e da paginação vindos do backend
  const [planos, setPlanos] = useState([]);
  const [paginacao, setPaginacao] = useState({ paginaAtual: 1, totalPaginas: 1, totalItens: 0 });

  // 8 Estados do formulário de cadastro/edição
  const [titulo, setTitulo] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [ementa, setEmenta] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [conteudos, setConteudos] = useState('');
  const [recursosApoio, setRecursosApoio] = useState('');
  const [tags, setTags] = useState('');

  const [idEditando, setIdEditando] = useState(null);

  // Estados dos Filtros, Busca, Ordenação e Página Atual
  const [busca, setBusca] = useState('');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [filtroTag, setFiltroTag] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('recente');
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Buscar planos com todos os parâmetros (GET)
  const buscarPlanos = () => {
    axios.get('http://localhost:3000/api/planos', {
      params: {
        page: paginaAtual,
        limit: 5, // Define o limite fixo de 5 itens por página
        busca: busca,
        disciplina: filtroDisciplina,
        tag: filtroTag,
        data_prevista: filtroData,
        ordenarPor: ordenarPor
      }
    })
    .then(resposta => {
      // O backend agora envelopa os dados em 'dados' e 'paginacao'
      setPlanos(resposta.data.dados);
      setPaginacao(resposta.data.paginacao);
    })
    .catch(erro => console.error('Erro ao buscar os planos:', erro));
  };

  // Recarrega a busca sempre que a página, os filtros ou a ordenação mudarem
  useEffect(() => {
    buscarPlanos();
  }, [paginaAtual, filtroDisciplina, filtroTag, filtroData, ordenarPor]);

  // Função para lidar com o clique do botão de "Buscar" por título
  const lidarComBusca = (e) => {
    e.preventDefault();
    setPaginaAtual(1); // Reseta para a primeira página ao buscar
    buscarPlanos();
  };

  const limparFormulario = () => {
    setTitulo('');
    setObjetivo('');
    setEmenta('');
    setDataPrevista('');
    setDisciplina('');
    setConteudos('');
    setRecursosApoio('');
    setTags('');
    setIdEditando(null);
  };

  const salvarPlano = (evento) => {
    evento.preventDefault();
    const dadosPlano = { 
      titulo, objetivo, ementa, 
      data_prevista: dataPrevista || null, 
      disciplina, conteudos, recursos_apoio: recursosApoio, tags 
    };

    if (idEditando) {
      axios.put(`http://localhost:3000/api/planos/${idEditando}`, dadosPlano)
        .then(() => {
          alert('Plano atualizado com sucesso!');
          buscarPlanos();
          limparFormulario();
        })
        .catch(() => alert('Erro ao atualizar o plano.'));
    } else {
      axios.post('http://localhost:3000/api/planos', dadosPlano)
        .then(() => {
          alert('Plano salvo com sucesso!');
          buscarPlanos();
          limparFormulario();
        })
        .catch(() => alert('Erro ao salvar o plano.'));
    }
  };

  const prepararEdicao = (plano) => {
    setTitulo(plano.titulo);
    setObjetivo(plano.objetivo);
    setEmenta(plano.ementa);
    setDataPrevista(plano.data_prevista ? plano.data_prevista.substring(0, 10) : '');
    setDisciplina(plano.disciplina);
    setConteudos(plano.conteudos);
    setRecursosApoio(plano.recursos_apoio || '');
    setTags(plano.tags || '');
    setIdEditando(plano.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const excluirPlano = (id) => {
    const confirmacao = window.confirm('Tem certeza que deseja excluir este plano?');
    if (confirmacao) {
      axios.delete(`http://localhost:3000/api/planos/${id}`)
        .then(() => {
          alert('Plano excluído com sucesso!');
          buscarPlanos();
        })
        .catch(() => alert('Erro ao excluir the plano.'));
    }
  };

  // Reseta todos os filtros de busca de uma vez
  const limparFiltros = () => {
    setBusca('');
    setFiltroDisciplina('');
    setFiltroTag('');
    setFiltroData('');
    setOrdenarPor('recente');
    setPaginaAtual(1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '850px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Sistema de Planos de Aula</h1>
      
      {/* --- FORMULÁRIO DE CADASTRO/EDIÇÃO --- */}
      <div style={{ background: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>{idEditando ? 'Editar Plano de Aula' : 'Criar Novo Plano'}</h2>
        <form onSubmit={salvarPlano} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="Título da Aula *" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ flex: 2, padding: '8px' }} />
            <input placeholder="Disciplina *" value={disciplina} onChange={(e) => setDisciplina(e.target.value)} required style={{ flex: 1, padding: '8px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#555' }}>Data Prevista:</label>
            <input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} style={{ padding: '8px', flex: 1 }} />
            <input placeholder="Tags (separadas por vírgula)" value={tags} onChange={(e) => setTags(e.target.value)} style={{ padding: '8px', flex: 1 }} />
          </div>
          <textarea placeholder="Objetivo da Aula *" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} required style={{ padding: '8px', minHeight: '50px' }} />
          <textarea placeholder="Ementa / Resumo *" value={ementa} onChange={(e) => setEmenta(e.target.value)} required style={{ padding: '8px', minHeight: '60px' }} />
          <textarea placeholder="Conteúdos programáticos *" value={conteudos} onChange={(e) => setConteudos(e.target.value)} required style={{ padding: '8px', minHeight: '60px' }} />
          <textarea placeholder="Recursos de Apoio (links, livros...)" value={recursosApoio} onChange={(e) => setRecursosApoio(e.target.value)} style={{ padding: '8px', minHeight: '40px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: idEditando ? '#28a745' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {idEditando ? 'Atualizar Plano' : 'Salvar Plano'}
            </button>
            {idEditando && (
              <button type="button" onClick={limparFormulario} style={{ padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* - SEÇÃO DE BUSCA E FILTROS AVANÇADOS - */}
      <div style={{ background: '#f1f3f5', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Busca e Filtros</h3>
        
        {/* Barra de pesquisa principal (Título) */}
        <form onSubmit={lidarComBusca} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input placeholder="Buscar por Título da Aula..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }} />
          <button type="submit" style={{ padding: '8px 15px', background: '#495057', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Buscar</button>
        </form>

        {/* Filtros secundários e ordenação */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input placeholder="Filtrar Disciplina" value={filtroDisciplina} onChange={(e) => { setFiltroDisciplina(e.target.value); setPaginaAtual(1); }} style={{ padding: '6px', flex: 1, minWidth: '130px' }} />
          <input placeholder="Filtrar Tag" value={filtroTag} onChange={(e) => { setFiltroTag(e.target.value); setPaginaAtual(1); }} style={{ padding: '6px', flex: 1, minWidth: '130px' }} />
          <input type="date" value={filtroData} onChange={(e) => { setFiltroData(e.target.value); setPaginaAtual(1); }} style={{ padding: '6px', flex: 1, minWidth: '130px' }} />
          
          <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} style={{ padding: '6px', flex: 1, minWidth: '130px' }}>
            <option value="recente">Mais Recentes</option>
            <option value="titulo">Título (A-Z)</option>
          </select>

          <button onClick={limparFiltros} style={{ padding: '6px 12px', background: '#e2e3e5', color: '#383d41', border: '1px solid #ced4da', borderRadius: '4px', cursor: 'pointer' }}>
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* - LISTAGEM DE PLANOS - */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Meus Planos Cadastrados</h2>
        <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: 'bold' }}>Total: {paginacao.totalItens}</span>
      </div>

      {planos.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', margin: '30px 0' }}>Nenhum plano encontrado para os critérios selecionados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {planos.map(plano => (
            <li key={plano.id} style={{ marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '5px', borderLeft: '5px solid #007bff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{plano.titulo}</h3>
                <span style={{ fontSize: '12px', background: '#e2e3e5', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold', color: '#495057' }}>{plano.disciplina}</span>
              </div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Objetivo:</strong> {plano.objetivo}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Ementa:</strong> {plano.ementa}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Conteúdos:</strong> {plano.conteudos}</p>
              {plano.recursos_apoio && <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Recursos:</strong> {plano.recursos_apoio}</p>}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  Prévia: {plano.data_prevista ? new Date(plano.data_prevista).toLocaleDateString('pt-BR') : 'Não definida'}
                </span>
                <span style={{ fontSize: '13px', color: '#0056b3', fontWeight: '500' }}>
                  {plano.tags ? `Tags: ${plano.tags}` : ''}
                </span>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button onClick={() => prepararEdicao(plano)} style={{ padding: '5px 10px', background: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Editar</button>
                <button onClick={() => excluirPlano(plano.id)} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* - CONTROLES DE PAGINAÇÃO - */}
      {paginacao.totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '25px', padding: '10px 0' }}>
          <button 
            disabled={paginaAtual === 1} 
            onClick={() => setPaginaAtual(prev => prev - 1)}
            style={{ padding: '6px 12px', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer', background: '#fff', border: '1px solid #ced4da', borderRadius: '4px', opacity: paginaAtual === 1 ? 0.5 : 1 }}
          >
            Anterior
          </button>
          
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>
            Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
          </span>

          <button 
            disabled={paginaAtual === paginacao.totalPaginas} 
            onClick={() => setPaginaAtual(prev => prev + 1)}
            style={{ padding: '6px 12px', cursor: paginaAtual === paginacao.totalPaginas ? 'not-allowed' : 'pointer', background: '#fff', border: '1px solid #ced4da', borderRadius: '4px', opacity: paginaAtual === paginacao.totalPaginas ? 0.5 : 1 }}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

export default App;