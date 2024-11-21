import React, { useEffect, useState } from 'react';
import api from '../services/api';  // Assumindo que você tem uma instância do axios ou fetch configurada

function Carrinho() {
    const [carrinho, setCarrinho] = useState({ itens: [] });  // Inicializa com um objeto padrão
    const [userId, setUserId] = useState('');  // Inicializa o state para o userId

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

    return (
        <div className="carrinho">
            <h1>Seu Carrinho de Compras</h1>
            {carrinho.itens.length > 0 ? (
                <div>
                    <ul>
                        {carrinho.itens.map((item) => (
                            <li key={item.idProduto}>
                                {item.titulo} - Quantidade: {item.quantidade} - Preço: {item.preco}
                            </li>
                        ))}
                    </ul>
                    <div>
                        <h3>Total de Itens: {carrinho.totalItens}</h3>
                        <h3>Total: R$ {carrinho.totalPreco.toFixed(2)}</h3>
                    </div>
                    {/* Botão para continuar comprando */}
                    <button onClick={() => window.location.href = '/'}>Continuar Comprando</button>
                    {/* Botão para finalizar a compra (a funcionalidade será implementada depois) */}
                    <button onClick={() => alert('Finalizar compra ainda não implementado.')}>Finalizar Compra</button>
                </div>
            ) : (
                <p>Carrinho vazio ou erro ao carregar. Tente novamente mais tarde.</p>
            )}
        </div>
    );
}

export default Carrinho;
