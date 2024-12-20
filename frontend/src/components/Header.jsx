import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png"
import Favorito from "../assets/heart.png"
import Carrinho from "../assets/online-shopping.png"
import Perfil from "../assets/user.png"
import Procurar from "../assets/lupa.png"
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
    navigate('/carrinho');
  };

  const handleSairClick = () => {
    localStorage.removeItem('usuarioLogado');  
    navigate('/');
  };

  return (
    <header>
      <nav>
        <div className="nav-wrapper">
          <img src={Logo} alt="logo do site" className="logo"/>
          <ul className="nav-menu">
            <li><Link to="/">Home</Link></li>
            <li><a href="/livros">Livros</a></li>
            <li><a href="#promocoes">Promoções</a></li>
            <li><a href="#sobre">Sobre</a></li>
          </ul>
          <div className="barra-pesquisa">
            <img src={Procurar} alt="procurar por livros" className="logo-navbar-procurar"/>
            <span>Pesquisar</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#favoritos"><img src={Favorito} alt="favoritos" className="logo-navbar"/></a></li>
            <li><Link to="/carrinho" onClick={handleCarrinhoClick}><img src={Carrinho} alt="carrinho" className="logo-navbar"/></Link></li>
            <>
              {usuarioLogado ? (
                <>
                  <li>
                    <a onClick={handlePerfilClick}><img src={Perfil} alt="perfil" className="logo-navbar"/></a> 
                  </li>
                  <li>
                    <a onClick={handleSairClick}>Sair</a>
                  </li>
                </>
              ) : (
                <li>
                  <a onClick={handlePerfilClick}><img src={Perfil} alt="login" className="logo-navbar"/></a>
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
