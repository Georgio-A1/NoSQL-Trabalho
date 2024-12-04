import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"; 
import axios from 'axios';
import api from '../services/api';  // Assumindo que você tem uma instância do axios ou fetch configurada

function Carrinho() {
    const [carrinho, setCarrinho] = useState({ itens: [] });  // Inicializa com um objeto padrão
    const [userId, setUserId] = useState('');  // Inicializa o state para o userId
    const navigate = useNavigate();

    // Função para buscar o carrinho do backend
    useEffect(() => {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));  // Recupera o usuário logado
        console.log('Usuário logado do localStorage:', usuarioLogado);

        if (!usuarioLogado) {
            console.error('ID do usuário não encontrado');
            return;
        }

        // Atualiza o state com o ID do usuário
        setUserId(usuarioLogado.id);

        const fetchCarrinho = async () => {
            try {
                const response = await api.get(`/carrinho/${usuarioLogado.id}`);  // Faz a requisição para obter os dados do carrinho
                setCarrinho(response.data);
            } catch (error) {
                console.error('Erro ao buscar carrinho:', error);
            }
        };

        // Faz a requisição para buscar o carrinho se o usuário estiver logado
        if (usuarioLogado) {
            fetchCarrinho();
        }
    }, []);  // Não depende de userId diretamente aqui, pois já está no localStorage

    const handleFinalizarCompra = async() => {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        try {
            const response = await axios.post('http://localhost:5000/api/finalizar', { carrinho, usuarioLogado });
  
            // Verifica se o ID e o email estão na resposta
            if (response.data.id && response.data.email && carrinho) {  
                
            } else {
                console.error("ID ou Email ausente na resposta");
            }
        } catch (error) {
            // Verifica se a resposta de erro contém dados
            console.error("Erro ao finalizar compra:", error.response);
        }
    };

    const handleLimparCarrinho = async() => {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        try {
            const response = await api.delete(`/carrinho/${usuarioLogado.id}`);
            if(response.status == 204){
                setCarrinho({ itens: [], totalItens: 0, totalPreco: 0 });
            }
        } catch (error) {
            console.error('Erro ao buscar carrinho:', error);
        }
    };

    return (
        <div className="carrinho">
            <h1>Seu Carrinho de Compras</h1>
            {carrinho.itens.length > 0 ? (
                <div>
                    <ul>
                        {carrinho.itens.map((item) => (
                            <li key={item.idProduto}>
                                <img src={item.fotoProduto} alt={item.titulo} className="livro-imagem"></img> 
                                <span>
                                    {item.titulo} - Quantidade: {item.quantidade} - Preço: {item.preco} - Total deste item: {(item.quantidade*item.preco).toFixed(2)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div>
                        <h3>Total de Itens: {carrinho.totalItens}</h3>
                        <h3>Preço total do carrinho: {carrinho.totalPreco}</h3>                       
                    </div>
                    {/* Botão para continuar comprando */}
                    <button onClick={() => window.location.href = '/'}>Continuar Comprando</button>
                    {/* Botão para finalizar a compra (a funcionalidade será implementada depois) */}
                    <button onClick={handleFinalizarCompra}>Finalizar Compra</button>
                    <button onClick={handleLimparCarrinho}>Limpar carrinho</button>
                </div>
            ) : (
                <p>Nenhum livro adicionado. Navegue pelo nosso catálogo!</p>
            )}
        </div>
    );
}

export default Carrinho;
