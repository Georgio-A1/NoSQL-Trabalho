import React, { useEffect, useState } from "react";

const PerfilPage = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");

    // Se o usuário estiver logado e o valor for uma string JSON válida, faça o parsing
    if (usuarioLogado) {
      try {
        const parsedUsuario = JSON.parse(usuarioLogado);
        setUsuario(parsedUsuario); // Salve o usuário no estado
      } catch (error) {
        setUsuario(usuarioLogado); // Se não for JSON, trate como uma string simples
      }
    }
  }, []);

  return (
    <div>
      <h1>Página de Perfil</h1>
      {usuario ? (
        <div>
          <p>Bem-vindo, {usuario.email}</p> {/* Exibe o email do usuário */}
        </div>
      ) : (
        <p>Você não está logado.</p>
      )}
    </div>
  );
};

export default PerfilPage;
