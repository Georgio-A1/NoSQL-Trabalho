import React, { useEffect, useState } from 'react';
import api from '../services/api';  // Assumindo que você tem uma instância do axios ou fetch configurada

function Carrinho() {
    const [carrinho, setCarrinho] = useState({ itens: [] });
    const [userId, setUserId] = useState('');
    const [quantidadeSelecionada, setQuantidadeSelecionada] = useState({});
    
    // Função para buscar o carrinho do backend
    useEffect(() => {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) {
            console.error('ID do usuário não encontrado');
            return;
        }
        setUserId(usuarioLogado.id);

        const fetchCarrinho = async () => {
            try {
                const response = await api.get(`/carrinho/${usuarioLogado.id}`);
                setCarrinho(response.data);
            } catch (error) {
                console.error('Erro ao buscar carrinho:', error);
            }
        };

        if (usuarioLogado) {
            fetchCarrinho();
        }
    }, []);

    // Função para remover um item específico do carrinho
    const removerItem = async (idProduto) => {
        const quantidade = quantidadeSelecionada[idProduto];
        if (quantidade > 0) {
            try {
                await api.delete(`/carrinho/${userId}/remover/${idProduto}`, { data: { quantidade } });

                // Atualiza o estado do carrinho após remoção
                const novoCarrinho = { ...carrinho };
                const itemIndex = novoCarrinho.itens.findIndex(item => item.idProduto === idProduto);

                if (itemIndex !== -1) {
                    novoCarrinho.itens[itemIndex].quantidade -= quantidade;
                    if (novoCarrinho.itens[itemIndex].quantidade <= 0) {
                        novoCarrinho.itens.splice(itemIndex, 1); // Remove o item se a quantidade for zero ou menos
                    }
                    novoCarrinho.totalItens -= quantidade;
                    novoCarrinho.totalPreco -= novoCarrinho.itens[itemIndex].preco * quantidade;
                }
                setCarrinho(novoCarrinho);
                setQuantidadeSelecionada({ ...quantidadeSelecionada, [idProduto]: 0 }); // Reseta a quantidade selecionada
            } catch (error) {
                console.error('Erro ao remover item:', error);
            }
        }
    };

    // Função para remover todos os itens do carrinho
    const removerTodosItens = async () => {
        try {
            await api.delete(`/carrinho/${userId}/remover-todos`);
            setCarrinho({ itens: [], totalItens: 0, totalPreco: 0 });
        } catch (error) {
            console.error('Erro ao remover todos os itens:', error);
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
                                {item.titulo} - Quantidade: {item.quantidade} - Preço: R$ {item.preco}
                                
                                {/* Dropdown para selecionar a quantidade a ser removida */}
                                <select 
                                    value={quantidadeSelecionada[item.idProduto] || 0} 
                                    onChange={(e) => setQuantidadeSelecionada({ ...quantidadeSelecionada, [item.idProduto]: parseInt(e.target.value) })}>
                                    <option value="0">Selecione a quantidade para remover</option>
                                    {Array.from({ length: item.quantidade }, (_, i) => (
                                        <option key={i+1} value={i+1}>Remover {i+1} {i+1 > 1 ? 'itens' : 'item'}</option>
                                    ))}
                                </select>

                                {/* Botão para remover o item */}
                                <button onClick={() => removerItem(item.idProduto)}>Remover</button>
                            </li>
                        ))}
                    </ul>
                    <div>
                        <h3>Total de Itens: {carrinho.totalItens}</h3>
                        <h3>Total: R$ {carrinho.totalPreco.toFixed(2)}</h3>
                    </div>
                    <button onClick={() => window.location.href = '/'}>Continuar Comprando</button>
                    <button onClick={() => window.location.href = '/finalizar-compra'}>Finalizar Compra</button>
                    <button onClick={removerTodosItens}>Remover Todos os Itens</button>
                </div>
            ) : (
                <p>Carrinho vazio ou erro ao carregar. Tente novamente mais tarde.</p>
            )}
        </div>
    );
}

export default Carrinho;
