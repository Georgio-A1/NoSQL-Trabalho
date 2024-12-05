import React from "react";
import LogoFooter from "../assets/logo-footer.png"
import "../style.css";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <a href="/">
          <img src={LogoFooter} alt="logo do site" className="logo"/>
        </a>
        <span>Todos os direitos reservados © 2024</span>
        <div className="footer-contato">
          <span>+55 (035) 3222-2223</span>
          <button>Entre em contato</button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
