import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom'; // Adicionar Navigate
import api from '../services/api';
import '../style.css';

function BookDetail() {
    const { id } = useParams(); // Obtém o ID do livro da URL
    const [livro, setLivro] = useState(null); // Detalhes do livro
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLivro = async () => {
            try {
                const response = await api.get(`/livros/${id}`);
                setLivro(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar livro:", error);
                setLoading(false);
            }
        };

        fetchLivro();
    }, [id]);

    const handleAddToCart = async () => {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        console.log("Usuário Logado:", usuarioLogado); // Verifique se está sendo retornado corretamente
    
        if (!usuarioLogado) {
            console.log("Usuário não está logado, redirecionando para o login");
            return <Navigate to="/login" />; // Redireciona para o login caso não esteja logado
        }
    
        const usuario = JSON.parse(usuarioLogado);
        const usuarioId = usuario.id; // Usando o ID armazenado
        console.log("ID do usuário:", usuarioId);  // Verifique se o ID está correto
    
        if (!usuarioId) {
            console.error("ID do usuário está ausente");
            return;
        }
    
        try {
            const response = await api.post(`/carrinho/${encodeURIComponent(usuarioId)}`, {
                idProduto: livro._id,
                quantidade: 1,
            });
            console.log(`Livro "${livro.titulo}" adicionado ao carrinho com sucesso.`);
            alert(`Livro "${livro.titulo}" adicionado ao carrinho com sucesso.`);
        } catch (error) {
            console.error("Erro ao adicionar livro ao carrinho:", error);
            alert(`Erro ao adicionar livro "${livro.titulo}" ao carrinho`);
        }
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (!livro) {
        return <p>Livro não encontrado.</p>;
    }

    return (
        <div className="book-detail-container">
            <div className="book-detail-content">
                <img
                    src={livro.imagemCapa}
                    alt={livro.titulo}
                    className="book-detail-image"
                />
                <div className="book-detail-info">
                    <h1>{livro.titulo}</h1>
                    <h2 className="book-author">Por {livro.autor}</h2>
                    <p className="book-description">Descrição do livro: {livro.descricao}</p>
                    <div>
                        <h3>Características</h3>
                        <p className="book-category">Categoria: {livro.categorias.join(', ')}</p>
                        <p className="book-publisher">Editora: {livro.editora}</p>
                        <p className="book-pages">Número de páginas: {livro.numeroPaginas}</p>
                        <p className="book-language">Idioma: {`{livro.idioma}` == "pt" ? "Português do Brasil" : "Inglês"}</p>
                        <p className="book-price">
                            Preço: {livro.moeda == 'BRL' ? 'R$' : '$'} {livro.preco.toFixed(2)}
                        </p>
                    </div>                   
                    <button className="add-to-cart-button" onClick={handleAddToCart}>
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BookDetail;
