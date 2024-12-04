import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../style.css';

function Carousel() {
  const [livros, setLivros] = useState([]); // Todos os livros
  const [livrosFiltrados, setLivrosFiltrados] = useState([]); // Livros filtrados por categoria
  const [startIndex, setStartIndex] = useState(0); // Índice inicial do carrossel
  const livrosPorPagina = 5; // Quantos livros mostrar de cada vez

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        const response = await api.get('/livros');
        setLivros(response.data);
        setLivrosFiltrados(response.data); // Inicialmente, mostrar todos os livros
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
      }
    };

    fetchLivros();
  });

  const handlePrev = () => {
    // Vai para o grupo anterior
    setStartIndex((prev) => Math.max(prev - livrosPorPagina, 0));
  };

  const handleNext = () => {
    // Vai para o próximo grupo
    setStartIndex((prev) =>
      Math.min(prev + livrosPorPagina, livrosFiltrados.length - livrosPorPagina)
    );
  };

  const handleFilter = (categoria) => {
    // Filtrar livros pela categoria
    const filtrados = livros.filter((livro) => livro.categories.includes(categoria));
    setLivrosFiltrados(filtrados);
    setStartIndex(0); // Reiniciar o carrossel ao início
  };

  const livrosVisiveis = livrosFiltrados.slice(startIndex, startIndex + livrosPorPagina);

  return (
    <section>
      <div className="carrosel-menu">
        <h3>Explore por gênero</h3>
        <ul>
          <li><button onClick={() => handleFilter("Fiction")}>Ficção</button></li>
          <li><button onClick={() => handleFilter("Action")}>Ação</button></li>
          <li><button onClick={() => handleFilter("Adventure")}>Aventura</button></li>
          <li><button onClick={() => handleFilter("Romance")}>Romance</button></li>
          <li><button onClick={() => handleFilter("Fantasy")}>Fantasia</button></li>
          <li><button onClick={() => handleFilter("Infanto-Juvenil")}>Infanto-Juvenil</button></li>
          <li><button onClick={() => setLivrosFiltrados(livros)}>Todos</button></li> {/* Mostrar todos os livros */}
        </ul>
      </div>
      <div className="carrosel-container">
        <button className="nav-button" onClick={handlePrev} disabled={startIndex === 0}>
          &#8249; {/* Ícone de seta esquerda */}
        </button>
        <div className="carrosel-livros">
          {livrosVisiveis.map((livro) => (
            <div key={livro._id} className="livro-card">
              <Link to={`/livros/${livro._id}`}>
                <img src={livro.cover_image_url} alt={livro.title} className="livro-imagem" />
                <h4>{livro.title}</h4>
                <p>{livro.authors}</p>
                <span>{livro.currency} {livro.price.toFixed(2)}</span>
              </Link>
            </div>
          ))}
        </div>
        <button className="nav-button" onClick={handleNext} disabled={startIndex + livrosPorPagina >= livrosFiltrados.length}>
          &#8250; {/* Ícone de seta direita */}
        </button>
      </div>
    </section>
  );
}

export default Carousel;
