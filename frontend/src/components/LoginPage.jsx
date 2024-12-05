import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      console.log("Enviando requisição para login...");
      console.log("Email:", email, "Senha:", senha);

      try {
          const response = await axios.post('http://localhost:5000/api/login', { email, senha });
          console.log("Resposta do servidor:", response); // Log da resposta do servidor

          // Verifica se o ID e o email estão na resposta
          if (response.data.id && response.data.email) {
              console.log("ID do usuário:", response.data.id);
              console.log("Email do usuário:", response.data.email);

              // Salva o ID e o email no localStorage
              const { id, email: usuarioEmail } = response.data;
              const usuarioData = { id, email: usuarioEmail };
              localStorage.setItem('usuarioLogado', JSON.stringify(usuarioData));
              console.log("Dados do usuário salvos no localStorage:", usuarioData);

              setMensagem('Login realizado com sucesso!');

              const origem = localStorage.getItem('origem');
              if (origem) {
                  navigate(origem);
                  localStorage.removeItem('origem');
              } else {
                  navigate('/');
              }
          } else {
              console.error("ID ou Email ausente na resposta");
              setMensagem('Erro no login: dados incompletos');
          }
      } catch (error) {
          // Verifica se a resposta de erro contém dados
          console.error("Erro ao realizar o login:", error.response);
          setMensagem(error.response?.data?.error || 'Erro ao realizar o login');
      }
  };

    return (
        <div className='login-page'>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Senha" 
                    value={senha} 
                    onChange={(e) => setSenha(e.target.value)} 
                    required 
                />
                <button type="submit">Entrar</button>
            </form>
            {mensagem && <p>{mensagem}</p>}
        </div>
    );
};

export default LoginPage;
