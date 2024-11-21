import React from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "../style.css";

function Header() {
  const usuarioLogado = localStorage.getItem('usuarioLogado'); // Verifica se o usuário está logado
  const navigate = useNavigate(); // Hook para navegação

  const handlePerfilClick = () => {
    if (usuarioLogado) {
      navigate('/perfil'); // Redireciona para a página de perfil se estiver logado
    } else {
      localStorage.setItem('origem', '/perfil'); // Armazena a origem para redirecionamento posterior
      navigate('/login'); // Redireciona para a página de login
    }
  };

  const handleCarrinhoClick = () => {
    if (usuarioLogado) {
      navigate('/carrinho'); // Redireciona para a página do carrinho se estiver logado
    } else {
      localStorage.setItem('origem', '/carrinho'); // Armazena a origem para redirecionamento posterior
      navigate('/login'); // Redireciona para a página de login
    }
  };

  return (
    <header>
      <nav>
        <div className="nav-wrapper">
          <a href="#" className="brand-logo">Logo</a>
          <ul className="nav-menu">
            <li><a href="#livros">Livros</a></li>
            <li><a href="#promocoes">Promoções</a></li>
            <li><a href="#delivery">Delivery</a></li>
            <li><a href="#sobre">Sobre</a></li>
          </ul>
          <a href="#" className="barra-pesquisa">[Barra de pesquisar]</a>
          <ul className="nav-menu">
            <li><a href="#favoritos">Favoritos</a></li>
            {/* Alterar o link do Carrinho para o Link do React Router */}
            <li><Link to="/carrinho" onClick={handleCarrinhoClick}>Carrinho</Link></li>
            <li>
              {usuarioLogado ? (
                <Link to="/perfil" onClick={handlePerfilClick}>Perfil</Link> 
              ) : (
                <Link to="/login">Login</Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
