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

  const handleLoginClick = () => {
    navigate('/login'); // Redireciona para a página de login
  };

  const handleSairClick = () => {
      localStorage.removeItem('usuarioLogado');  
      console.log("Você fez logout.");
      navigate('/'); // Redireciona para a home e efetua logout
  };

  const handleCarrinhoClick = () => {
    
      navigate('/carrinho'); // Redireciona para a página do carrinho se estiver logado
      console.log(usuarioLogado);
    
  };

  return (
    <header>
      <nav>
        <div className="nav-wrapper">
          <a href="#" className="brand-logo">Logo</a>
          <ul className="nav-menu">
            <li><Link to="/">Home</Link></li>
            <li><a href="#promocoes">Promoções</a></li>
            <li><a href="#delivery">Delivery</a></li>
            <li><a href="#sobre">Sobre</a></li>
          </ul>
          <a href="#" className="barra-pesquisa">[Barra de pesquisar]</a>
          <ul className="nav-menu">
            <li><a href="#favoritos">Favoritos</a></li>
            {/* Alterar o link do Carrinho para o Link do React Router */}
            <li><a onClick={handleCarrinhoClick}>Carrinho</a></li>
            <>
              {usuarioLogado ? (
                <>
                  <li>
                    <a onClick={handlePerfilClick}>Perfil</a> 
                  </li>
                  <li>
                    <a onClick={handleSairClick}>Sair</a>
                  </li>
                </>
              ) : (
                <li>
                  <a onClick={handleLoginClick}>Login</a>
                </li>
              )}
            </>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
