import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [planos, setPlanos] = useState([]);

  // Estados dos campos do formulário
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [metodologia, setMetodologia] = useState('');

  // Novo estado: "idEditando" vai guardar o ID do plano sendo editado (ou null se for criação)
  const [idEditando, setIdEditando] = useState(null);

  // BUSCAR PLANOS (GET)
  const buscarPlanos = () => {
    axios.get('http://localhost:3000/api/planos')
      .then(resposta => setPlanos(resposta.data))
      .catch(erro => console.error('Erro ao buscar os planos:', erro));
  };

  useEffect(() => {
    buscarPlanos();
  }, []);

  // Função auxiliar para limpar a tela
  const limparFormulario = () => {
    setTitulo('');
    setTema('');
    setObjetivos('');
    setConteudo('');
    setMetodologia('');
    setIdEditando(null); // Desliga o modo de edição
  };

  // CRIAR (POST) ou ATUALIZAR (PUT)
  const salvarPlano = (evento) => {
    evento.preventDefault();
    const dadosPlano = { titulo, tema, objetivos, conteudo, metodologia };

    if (idEditando) {
      // Se tiver um ID, ele vai Editar
      axios.put(`http://localhost:3000/api/planos/${idEditando}`, dadosPlano)
        .then(() => {
          alert('Plano atualizado com sucesso!'); // Pop-up simples de sucesso
          buscarPlanos();
          limparFormulario();
        })
        .catch(() => alert('Erro ao atualizar o plano.'));
    } else {
      // Se não tiver ID, ele vai Criar
      axios.post('http://localhost:3000/api/planos', dadosPlano)
        .then(() => {
          alert('Plano salvo com sucesso!'); // Pop-up simples de sucesso
          buscarPlanos();
          limparFormulario();
        })
        .catch(() => alert('Erro ao salvar o plano.'));
    }
  };

  // PREPARAR EDIÇÃO (Acionado pelo botão Editar)
  const prepararEdicao = (plano) => {
    setTitulo(plano.titulo);
    setTema(plano.tema);
    setObjetivos(plano.objetivos);
    setConteudo(plano.conteudo);
    setMetodologia(plano.metodologia || ''); // Evita erro se o campo for vazio no banco
    setIdEditando(plano.id); // Avisa o sistema que está no modo Edição

    // Rolar a página suavemente até o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // DELETAR (Acionado pelo botão Excluir)
  const excluirPlano = (id) => {
    // Pop-up nativo de confirmação
    const confirmacao = window.confirm('Tem certeza que deseja excluir este plano? Essa ação não pode ser desfeita.');
    
    if (confirmacao) {
      axios.delete(`http://localhost:3000/api/planos/${id}`)
        .then(() => {
          alert('Plano excluído com sucesso!'); // Pop-up de aviso final
          buscarPlanos();
        })
        .catch(() => alert('Erro ao excluir o plano.'));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Sistema de Planos de Aula</h1>
      
      {/* - CAIXA DO FORMULÁRIO - */}
      <div style={{ background: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        
        {/* Muda o título dinamicamente */}
        <h2>{idEditando ? 'Editar Plano de Aula' : 'Criar Novo Plano'}</h2>
        
        <form onSubmit={salvarPlano} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="Título da Aula" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ padding: '8px' }} />
          <input placeholder="Tema" value={tema} onChange={(e) => setTema(e.target.value)} required style={{ padding: '8px' }} />
          <textarea placeholder="Objetivos" value={objetivos} onChange={(e) => setObjetivos(e.target.value)} required style={{ padding: '8px', minHeight: '60px' }} />
          <textarea placeholder="Conteúdo" value={conteudo} onChange={(e) => setConteudo(e.target.value)} required style={{ padding: '8px', minHeight: '60px' }} />
          <textarea placeholder="Metodologia (opcional)" value={metodologia} onChange={(e) => setMetodologia(e.target.value)} style={{ padding: '8px', minHeight: '60px' }} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* O botão muda de cor e texto dependendo do modo */}
            <button type="submit" style={{ flex: 1, padding: '10px', background: idEditando ? '#28a745' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {idEditando ? 'Atualizar Plano' : 'Salvar Plano'}
            </button>
            
            {/* O botão cancelar só aparece se estiver editando */}
            {idEditando && (
              <button type="button" onClick={limparFormulario} style={{ padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      {/* - LISTA DE PLANOS - */}
      <h2>Meus Planos Cadastrados</h2>
      {planos.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhum plano cadastrado ainda.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {planos.map(plano => (
            <li key={plano.id} style={{ marginBottom: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '5px', borderLeft: '5px solid #007bff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{plano.titulo}</h3>
              <p style={{ margin: '5px 0' }}><strong>Tema:</strong> {plano.tema}</p>
              <p style={{ margin: '5px 0' }}><strong>Objetivos:</strong> {plano.objetivos}</p>
              
              {/* - BOTÕES DE AÇÃO - */}
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button onClick={() => prepararEdicao(plano)} style={{ padding: '5px 10px', background: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Editar
                </button>
                <button onClick={() => excluirPlano(plano.id)} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Excluir
                </button>
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;