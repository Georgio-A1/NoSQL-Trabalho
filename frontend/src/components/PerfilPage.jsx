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
            <ul className="card-pedido-wrapper">
              {historico.length > 0 ? (
                historico.map((pedido) => (
                  <li key={pedido.id_pedido} className='card-pedido'>
                    <h4>Pedido ID: {pedido.id_pedido}</h4>
                    <span>Data: {formatarData(pedido.data)}</span>
                    <span>Valor Total: R$ {pedido.valor_total}</span>
                    <span>Método de Pagamento: {pedido.metodo_pagamento}</span>
                    <span>Itens do Pedido:</span>
                    <ul id="card-pedido-sublista">
                      {pedido.itens.map((item) => (
                        <li key={item.id_produto}>
                          <span>Título: {item.livro ? item.livro.titulo : "Livro não encontrado"}</span>
                          <span>Quantidade: {item.quantidade}</span>
                          <span>Preço Unitário: R$ {item.valor_unitario}</span>
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
