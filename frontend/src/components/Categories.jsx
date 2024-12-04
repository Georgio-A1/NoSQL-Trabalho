import React from "react";
import "../style.css";

function Categories() {
  return (
    <section>
      <div className="categorias">
        <h3>Categorias</h3>
        <div className="grid-categorias">
          <div>Livros usados</div>
          <div>Livros novos</div>
          <div>Best-sellers</div>
          <div>E-books</div>
          <div>Audiolivros</div>
          <div>Kit presente</div>
        </div>
      </div>
    </section>
  );
}

export default Categories;
