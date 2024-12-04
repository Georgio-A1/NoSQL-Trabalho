import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom'; // Adicionar Navigate
import api from '../services/api'; // Importa a instância do Axios configurada
import '../style.css';

function DeleteAll() {
    // Estado de carregamento e se o processo foi bem-sucedido
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // useEffect para buscar dados quando o componente for montado
    useEffect(() => {
        const fetchJSON = async () => {
            try {
                const response = await api.delete('/limpa-banco'); // Chama a rota do backend
                setSuccess(true); // Define sucesso quando a resposta for recebida
                setLoading(false); // Define que o carregamento terminou
            } catch (error) {
                console.error("Erro ao buscar dados para limpar o banco:", error);
                setError("Erro ao buscar dados para limpar o banco."); // Armazena erro
                setLoading(false); // Define que o carregamento terminou
            }
        };

        fetchJSON();
    }, []); // A dependência vazia faz com que o useEffect seja executado apenas uma vez após a montagem

    if (loading) {
        return <div>Carregando...</div>; // Exibe "Carregando..." enquanto os dados estão sendo carregados
    }

    if (error) {
        return <div>{error}</div>; // Exibe mensagem de erro se algo deu errado
    }

    // Redireciona se a operação de popular o banco foi bem-sucedida
    if (success) {
        return <Navigate to="/sucesso" />; // Redireciona para a página de sucesso, por exemplo
    }

    return (
        <div>
            <h1>Detalhes do Livro</h1>
            <p>Dados excluídos com sucesso do banco de dados!</p>
        </div>
    );
}

export default DeleteAll;
