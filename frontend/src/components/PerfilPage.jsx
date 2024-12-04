import React, { useEffect, useState } from "react";
import api from "../services/api";

const PerfilPage = () => {
  const [usuario, setUsuario] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");

    
    if (usuarioLogado) {
      try {
        const parsedUsuario = JSON.parse(usuarioLogado);
        setUsuario(parsedUsuario); // Salva o usuário no estado
      } catch (error) {
        setUsuario(usuarioLogado);
      }
    }
  }, []);

  useEffect(() => {
    if (usuario && usuario.id) {
      console.log("Buscando histórico para o usuário:", usuario.id);
      setCarregando(true);
  
      api
        .get(`/historico/${usuario.id}`)
        .then((response) => {
          console.log("Dados do histórico:", response.data);
          setHistorico(response.data);
        })
        .catch((error) => {
          console.error("Erro ao carregar histórico de compras", error);
        })
        .finally(() => {
          setCarregando(false);
        });
    }
  }, [usuario]);

  // Função para formatar a data no formato 'dd/mm/yyyy'
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return `${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()}`;
  };

  return (
    <div>
      <h1>Página de Perfil</h1>
      {usuario ? (
        <div>
          <p>Bem-vindo, {usuario.email}</p>
          <h2>Histórico de Compras</h2>
          {carregando ? (
            <p>Carregando...</p> // Exibe durante o carregamento
          ) : (
            <ul>
              {historico.length > 0 ? (
                historico.map((pedido) => (
                  <li key={pedido.id_pedido}>
                    <h3>Pedido ID: {pedido.id_pedido}</h3>
                    <p><strong>Data:</strong> {formatarData(pedido.data)}</p>
                    <p><strong>Valor Total:</strong> R$ {pedido.valor_total}</p>
                    <p><strong>Método de Pagamento:</strong> {pedido.metodo_pagamento}</p>
                    <h4>Itens do Pedido:</h4>
                    <ul>
                      {pedido.itens.map((item) => (
                        <li key={item.id_produto}>
                          <p><strong>Título:</strong> {item.livro ? item.livro.titulo : "Livro não encontrado"}</p>
                          <p><strong>Quantidade:</strong> {item.quantidade}</p>
                          <p><strong>Preço Unitário:</strong> R$ {item.valor_unitario}</p>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              ) : (
                <p>Você não tem histórico de compras.</p>
              )}
            </ul>
          )}
        </div>
      ) : (
        <p>Você não está logado.</p>
      )}
    </div>
  );
};

export default PerfilPage;
