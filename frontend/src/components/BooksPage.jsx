import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../style.css';

const BooksPage = () => {
  const [livros, setLivros] = useState([]);  // Livros carregados (com ou sem filtro)
  const [livrosFiltrados, setLivrosFiltrados] = useState([]);  // Livros filtrados por categoria
  const [pagina, setPagina] = useState(1);  // Página atual para controle da paginação
  const livrosPorPagina = 12;  // Quantos livros mostrar de cada vez
  const [carregando, setCarregando] = useState(false);  // Estado de carregamento

  // Função para carregar livros com base na página e categoria
  const carregarLivros = async (categoria = '') => {
    setCarregando(true);
    try {
      const response = await api.get('/livros', {
        params: {
          page: pagina,  // Página para controlar a paginuação
          categoria,  // Filtro de categoria
          limit: livrosPorPagina,  // Limite de livros por página
        }
      });

      const { livros, totalPaginas } = response.data;  // Desestruturando resposta

      // Se for a primeira página, substitui todos os livros
      if (pagina === 1) {
        setLivros(livros);
        setLivrosFiltrados(livros);
      } else {
        // Se não for a primeira página, adiciona os livros carregados à lista existente
        setLivros((prevLivros) => [...prevLivros, ...livros]);
        setLivrosFiltrados((prevLivros) => [...prevLivros, ...livros]);
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Efeito para carregar livros ao inicializar ou quando a página ou filtro mudar
  useEffect(() => {
    carregarLivros();  // Carrega livros sem filtro inicialmente
  }, [pagina]);  // Recarregar livros quando a página mudar

  // Função de filtro de categoria
  const handleFilter = (categoria) => {
    setPagina(1);  // Reinicia a página para o início
    setLivros([]); // Limpa os livros carregados
    setLivrosFiltrados([]); // Limpa os livros filtrados
    carregarLivros(categoria);  // Carrega livros filtrados pela categoria
  };

  // Função para avançar para a próxima página
  const handleNext = () => {
    setPagina(pagina + 1);  // Avança para a próxima página
  };

  // Função para voltar à página anterior
  const handlePrev = () => {
    setPagina(Math.max(pagina - 1, 1));  // Impede que a página fique menor que 1
  };

  return (
    <div className="books-page">
      <h1>Todos os Livros</h1>

      <div className="carrosel-menu">
        <h3>Explore por gênero</h3>
        <ul>
          <li><button onClick={() => handleFilter("Fiction")}>Ficção</button></li>
          <li><button onClick={() => handleFilter("Action")}>Ação</button></li>
          <li><button onClick={() => handleFilter("Adventure")}>Aventura</button></li>
          <li><button onClick={() => handleFilter("Romance")}>Romance</button></li>
          <li><button onClick={() => handleFilter("Fantasy")}>Fantasia</button></li>
          <li><button onClick={() => handleFilter("Infanto-Juvenil")}>Infanto-Juvenil</button></li>
          <li><button onClick={() => carregarLivros()}>Todos</button></li> {/* Mostrar todos os livros */}
        </ul>
      </div>

      <div className="livros-list">
        {livrosFiltrados.length === 0 ? (
          <p>Nenhum livro encontrado.</p>
        ) : (
          <div className="books-grid">
            {livrosFiltrados.map((livro) => (
              <div key={livro._id} className="book-card">
                <a href={`/livro/${livro._id}`}>
                  <img src={livro.imagemCapa} alt={livro.titulo} />
                  <div className="card-content">
                    <h3>{livro.titulo}</h3>
                    <p>Autor: {livro.autor}</p>
                    <p>{livro.moeda} {livro.preco.toFixed(2)}</p>
                    <p>Avaliação: {livro.avaliacao ? livro.avaliacao.toFixed(1) : "N/A"}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button onClick={handlePrev} disabled={carregando || pagina === 1}>
          {carregando ? 'Carregando...' : 'Anterior'}
        </button>
        <button onClick={handleNext} disabled={carregando}>
          {carregando ? 'Carregando...' : 'Próximo'}
        </button>
      </div>
    </div>
  );
};

export default BooksPage;
