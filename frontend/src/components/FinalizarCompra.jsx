import React, { useEffect, useState } from 'react';
import api from '../services/api';

function FinalizarCompra() {
    const [cliente, setCliente] = useState(null);
    const [carrinho, setCarrinho] = useState({ itens: [] });
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [userId, setUserId] = useState('');

    // Buscar o cliente e o carrinho
    useEffect(() => {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) {
            console.error('ID do usuário não encontrado');
            return;
        }

        setUserId(usuarioLogado.id);  // Armazenar o ID do usuário

        // Função para buscar os dados do cliente
        const fetchCliente = async () => {
            try {
                const response = await api.get(`/clientes/${usuarioLogado.id}`);
                setCliente(response.data);
            } catch (error) {
                console.error('Erro ao buscar cliente:', error);
            }
        };

        // Função para buscar o carrinho
        const fetchCarrinho = async () => {
            try {
                const response = await api.get(`/carrinho/${usuarioLogado.id}`);
                setCarrinho(response.data);
            } catch (error) {
                console.error('Erro ao buscar carrinho:', error);
            }
        };

        fetchCliente();  // Busca o cliente
        fetchCarrinho();  // Busca o carrinho
    }, []);

    const handleConfirmarPedido = async () => {
        if (!metodoPagamento) {
            alert('Por favor, escolha um método de pagamento');
            return;
        }

        try {
            const pedidoData = {
                itensCompra: carrinho.itens.map(item => ({
                    idProduto: item.idProduto,
                    quantidade: item.quantidade,
                })),
                metodoPagamento: metodoPagamento,
            };

            const response = await api.post(`/finalizar-compra/${userId}`, pedidoData);

            alert('Compra finalizada com sucesso!');
            // Redirecionar para a página do perfil para ver o histórico de compras
            window.location.href = '/perfil';
        } catch (error) {
            console.error('Erro ao criar o pedido:', error);
            alert('Erro ao finalizar a compra. Tente novamente.');
        }
    };

    return (
        <div>
            <h1>Finalizar Compra</h1>
            {cliente && carrinho.itens.length > 0 ? (
                <div>
                    <h3>Informações do Cliente</h3>
                    <p><strong>Nome:</strong> {cliente.nome}</p>
                    <p><strong>Endereço:</strong> {cliente.endereco}</p>
                    <p><strong>Telefone:</strong> {cliente.telefone}</p>

                    <h3>Carrinho</h3>
                    <ul>
                        {carrinho.itens.map(item => (
                            <li key={item.idProduto}>
                                {item.titulo} - Quantidade: {item.quantidade} - Preço: R$ {item.preco}
                            </li>
                        ))}
                    </ul>
                    <h3>Total: R$ {carrinho.totalPreco.toFixed(2)}</h3>

                    <h3>Método de Pagamento</h3>
                    <div className='pedido-finalizar'>
                        <select onChange={(e) => setMetodoPagamento(e.target.value)} value={metodoPagamento}>
                            <option value="">Selecione...</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                            <option value="Boleto">Boleto</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Pix">Pix</option>
                        </select>
                        <button onClick={handleConfirmarPedido}>Confirmar Pedido</button>
                    </div>
                </div>
            ) : (
                <p>Carregando informações...</p>
            )}
        </div>
    );
}

export default FinalizarCompra;
