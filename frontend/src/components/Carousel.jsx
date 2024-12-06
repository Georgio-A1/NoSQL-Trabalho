import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../style.css';

function Carousel() {
  const [livros, setLivros] = useState([]); // Todos os livros carregados
  const [livrosFiltrados, setLivrosFiltrados] = useState([]); // Livros filtrados por categoria
  const [startIndex, setStartIndex] = useState(0); // Índice inicial do carrossel
  const livrosPorPagina = 5; // Quantos livros mostrar de cada vez
  const [paginaAtual, setPaginaAtual] = useState(1); // Página atual para a navegação

  // Função para carregar livros com base na categoria e página
  const carregarLivros = async (categoria = '', pagina = 1) => {
    try {
      const response = await api.get('/livros', {
        params: {
          categoria, // Filtra os livros por categoria
          page: pagina, // Número da página
          limit: livrosPorPagina, // Limite de livros por requisição
        },
      });

      const livrosData = Array.isArray(response.data.livros) ? response.data.livros : [];

      if (pagina === 1) {
        // Se for a primeira página, limpa a lista e carrega os livros
        setLivros(livrosData);
        setLivrosFiltrados(livrosData);
      } else {
        // Adiciona os livros carregados ao final da lista
        setLivros((prevLivros) => [...prevLivros, ...livrosData]);
        setLivrosFiltrados((prevLivros) => [...prevLivros, ...livrosData]);
      }

      // Atualiza o estado da página
      setPaginaAtual(pagina);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  };

  // Carrega os livros quando o componente é montado ou quando o filtro muda
  useEffect(() => {
    carregarLivros('', paginaAtual); // Carrega livros sem filtro ao montar
  }, [paginaAtual]);

  // Função para aplicar o filtro de categoria
  const handleFilter = (categoria) => {
    setPaginaAtual(1); // Reinicia para a primeira página ao aplicar filtro
    setLivros([]); // Limpa livros carregados
    setLivrosFiltrados([]); // Limpa livros filtrados
    carregarLivros(categoria, 1); // Carrega livros da primeira página com filtro
  };

  // Função para navegar para a próxima página de livros
  const handleNext = () => {
    setStartIndex((prev) => prev + livrosPorPagina); // Avança no índice
    setPaginaAtual(paginaAtual + 1); // Avança para a próxima página
  };

  // Função para navegar para a página anterior
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => prev - livrosPorPagina); // Retrocede no índice
      setPaginaAtual(paginaAtual - 1); // Retrocede para a página anterior
    }
  };

  // Função para mostrar todos os livros
  const showAllBooks = () => {
    carregarLivros('', 1); // Reseta o filtro para todos os livros
    setPaginaAtual(1); // Volta para a primeira página
  };

  const livrosVisiveis = livrosFiltrados.slice(startIndex, startIndex + livrosPorPagina);

  return (
    <section>
      <div className="carrosel-container">
        <div className="carrosel-menu">
          <h3>Explore por gênero</h3>
          <ul>
            <li><button onClick={showAllBooks}>Todos</button></li> {/* Mostrar todos os livros */}
            <li><button onClick={() => handleFilter("Action")}>Ação</button></li>
            <li><button onClick={() => handleFilter("Adventure")}>Aventura</button></li>
            <li><button onClick={() => handleFilter("Fantasy")}>Fantasia</button></li>
            <li><button onClick={() => handleFilter("Fiction")}>Ficção</button></li>
            <li><button onClick={() => handleFilter("Infanto-Juvenil")}>Infanto-Juvenil</button></li>
            <li><button onClick={() => handleFilter("Romance")}>Romance</button></li>
          </ul>
        </div>
        <div className="carrosel-livros">
          <button className="nav-button" onClick={handlePrev} disabled={startIndex === 0}>
            &#8249; {/* Ícone de seta esquerda */}
          </button>          
          {livrosVisiveis.map((livro) => (
            <div key={livro._id} className="livro-card">
              <Link to={`/livro/${livro._id}`}>
                <img src={livro.imagemCapa} alt={livro.titulo} className="livro-imagem" />
                <h4>{livro.titulo}</h4>
                <p>{livro.autor}</p>
                <span>{livro.moeda == 'BRL' ? 'R$' : '$'} {livro.preco.toFixed(2)}</span>
              </Link>
            </div>
          ))}
          <button className="nav-button" onClick={handleNext} disabled={livrosVisiveis.length < livrosPorPagina}>
            &#8250; {/* Ícone de seta direita */}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Carousel;
