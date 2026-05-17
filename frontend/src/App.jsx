import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [planos, setPlanos] = useState([]);

  // Criando "espaços na memória" para os campos do formulário
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [metodologia, setMetodologia] = useState('');

  // Função para buscar os planos no backend
  const buscarPlanos = () => {
    axios.get('http://localhost:3000/api/planos')
      .then(resposta => setPlanos(resposta.data))
      .catch(erro => console.error('Erro ao buscar os planos:', erro));
  };

  // Roda a busca assim que a tela abre
  useEffect(() => {
    buscarPlanos();
  }, []);

  // Função disparada quando clica no botão de "Salvar Plano"
  const salvarPlano = (evento) => {
    evento.preventDefault(); // Evita que a página recarregue do zero

    // Junta os dados preenchidos
    const novoPlano = { titulo, tema, objetivos, conteudo, metodologia };

    // Envia os dados para a API (POST)
    axios.post('http://localhost:3000/api/planos', novoPlano)
      .then(() => {
        alert('Plano salvo com sucesso!');
        buscarPlanos(); // Atualiza a lista na tela
        
        // Limpa os campos do formulário
        setTitulo('');
        setTema('');
        setObjetivos('');
        setConteudo('');
        setMetodologia('');
      })
      .catch(erro => {
        console.error('Erro ao salvar:', erro);
        alert('Erro ao salvar o plano. Verifique os campos.');
      });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Sistema de Planos de Aula</h1>
      
      {/* - CAIXA DO FORMULÁRIO - */}
      <div style={{ background: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>Criar Novo Plano</h2>
        <form onSubmit={salvarPlano} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <input placeholder="Título da Aula" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ padding: '8px' }} />
          <input placeholder="Tema" value={tema} onChange={(e) => setTema(e.target.value)} required style={{ padding: '8px' }} />
          <textarea placeholder="Objetivos" value={objetivos} onChange={(e) => setObjetivos(e.target.value)} required style={{ padding: '8px', minHeight: '60px' }} />
          <textarea placeholder="Conteúdo" value={conteudo} onChange={(e) => setConteudo(e.target.value)} required style={{ padding: '8px', minHeight: '60px' }} />
          <textarea placeholder="Metodologia (opcional)" value={metodologia} onChange={(e) => setMetodologia(e.target.value)} style={{ padding: '8px', minHeight: '60px' }} />
          
          <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Salvar Plano
          </button>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;