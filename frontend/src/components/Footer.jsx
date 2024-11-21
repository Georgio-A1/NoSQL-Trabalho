import React from "react";
import "../style.css";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <a href="#" className="brand-logo">Logo</a>
        <span>Todos os direitos reservados ₢ 2024</span>
        <div className="footer-contato">
          <span>+55 (035) 3222-2223</span>
          <button>Entre em contato</button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
