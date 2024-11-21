const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Pool } = require('pg');
const { createClient } = require('@redis/client'); // Usando a versão mais recente do pacote

// Configurações do app
const app = express();
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/livros_db', {})
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB', err));

// Conectar ao Redis com a versão mais recente
const redisClient = createClient({
    socket: {
        host: 'localhost',  // Alterado para localhost
        port: 6379
    }
});

redisClient.on('connect', () => {
    console.log('Conectado ao Redis');
});

redisClient.on('error', (err) => {
    console.error('Erro no Redis:', err);
});

// Função de conexão assíncrona com o Redis
async function connectRedis() {
    try {
        await redisClient.connect(); // Conectar ao Redis
        console.log('Conexão com Redis estabelecida');
    } catch (err) {
        console.error('Erro ao conectar ao Redis:', err);
    }
}

connectRedis();

// Definir o modelo de dados do Livro
const livroSchema = new mongoose.Schema({
    _id: String,
    autor: String,
    avaliacao: { type: Number, default: 0 },
    categorias: [String],
    dataPublicacao: String,
    descricao: String,
    editora: String,
    estoque: Number,
    idioma: String,
    imagemCapa: String,
    moeda: String,
    numeroPaginas: Number,
    preco: Number,
    resenhas: Array,
    titulo: String
});

const Livro = mongoose.model('Livro', livroSchema);

// Conectar ao PostgreSQL
const pool = new Pool({
    user: 'postgres',        // Seu usuário do PostgreSQL
    host: 'localhost',
    database: 'Ecommerce',      // Nome do banco de dados
    password: 'postgres',      // Senha do banco de dados
    port: 5432,                 // Porta do PostgreSQL
});

// Rota para obter todos os livros
app.get('/api/livros', async (req, res) => {
    //console.log('Requisição recebida para obter todos os livros');
    try {
        // Removido o log que imprimia todos os livros
        const livros = await Livro.find();
        res.json(livros); // Retorna os livros sem imprimir no console
    } catch (err) {
        console.error('Erro ao obter livros', err);
        res.status(500).send("Erro ao obter livros");
    }
});

// Rota para obter um livro específico pelo ID
app.get('/api/livros/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Requisição recebida para obter livro com ID: ${id}`);
    try {
        const livro = await Livro.findById(id);
        if (!livro) {
            console.error(`Livro com ID ${id} não encontrado`);
            return res.status(404).send("Livro não encontrado");
        }
        res.json(livro);
    } catch (err) {
        console.error('Erro ao buscar o livro', err);
        res.status(500).send("Erro ao buscar o livro");
    }
});

// Rota para login
app.post('/api/login', async (req, res) => {
    console.log("Corpo da requisição de login:", req.body); // Verifique o corpo da requisição
    const { email, senha } = req.body;
    console.log('Tentando login para:', email); // Log adicional
    try {
        const result = await pool.query('SELECT * FROM Clientes WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log('Usuário não encontrado:', email);
            return res.status(404).send("Usuário não encontrado");
        }

        const usuario = result.rows[0];
        if (usuario.senha !== senha) {
            console.log('Senha incorreta para o usuário:', email);
            return res.status(400).send("Senha incorreta");
        }

        console.log("Login bem-sucedido para:", usuario.email); // Log de sucesso
        // Alteração aqui: agora retornamos o 'id_cliente' em vez de 'id'
        res.status(200).json({
            id: usuario.id_cliente,  // Usando 'id_cliente' em vez de 'id'
            email: usuario.email,
        });
    } catch (err) {
        console.error('Erro ao realizar o login:', err);
        res.status(500).send("Erro ao realizar o login");
    }
});

// Rota para adicionar um livro ao carrinho
app.post('/api/carrinho/:userId', async (req, res) => {
    const { userId } = req.params;  // Obtém o userId da URL
    const { idProduto, quantidade } = req.body;

    console.log('userId:', userId);  // Adiciona logs de depuração
    console.log('idProduto:', idProduto);

    try {
        // Verifica se o idProduto é um ObjectId válido
        const livro = await Livro.findById(idProduto);
        if (!livro) {
            console.log(`Livro com ID ${idProduto} não encontrado`);
            return res.status(404).send("Livro não encontrado");
        }

        // Verifica a conexão com o Redis usando async/await
        try {
            const pingResponse = await redisClient.ping();  // Usando ping com Promise
            console.log("Redis está disponível:", pingResponse);  // Log de sucesso
        } catch (err) {
            console.error("Erro de conexão com Redis:", err);  // Log detalhado de erro
            return res.status(500).send("Erro ao conectar ao Redis");
        }

        // Acessa o carrinho armazenado no Redis
        const reply = await redisClient.get(`carrinho:${userId}`);  // Usando async/await no lugar do callback
        console.log("Carrinho recuperado do Redis:", reply);

        let carrinho = reply ? JSON.parse(reply) : { itens: [], totalItens: 0, totalPreco: 0 };

        const livroExistente = carrinho.itens.find(item => item.idProduto === idProduto);
        if (livroExistente) {
            livroExistente.quantidade += quantidade;  // Se o livro já estiver no carrinho, aumenta a quantidade
        } else {
            carrinho.itens.push({
                idProduto: livro._id,
                titulo: livro.titulo,
                preco: livro.preco,
                quantidade: quantidade
            });
        }

        // Recalcule os totais
        carrinho.totalItens = carrinho.itens.reduce((total, item) => total + item.quantidade, 0);
        carrinho.totalPreco = carrinho.itens.reduce((total, item) => total + item.preco * item.quantidade, 0);

        console.log("Carrinho atualizado:", carrinho);

        // Salva o carrinho no Redis
        await redisClient.set(`carrinho:${userId}`, JSON.stringify(carrinho));  // Usando async/await no lugar do callback
        console.log("Carrinho salvo no Redis para o usuário:", userId);  // Log de sucesso

        res.status(200).json(carrinho);  // Retorna o carrinho atualizado
    } catch (error) {
        console.error("Erro ao adicionar livro ao carrinho:", error); // Adiciona logs de erro
        res.status(500).send("Erro ao adicionar ao carrinho");
    }
});

// Rota para buscar o carrinho
app.get('/api/carrinho/:userId', async (req, res) => {
    const { userId } = req.params;

    console.log(`Requisição recebida para buscar o carrinho do usuário ${userId}`);
    try {
        // Recupera o carrinho do Redis
        const reply = await redisClient.get(`carrinho:${userId}`);
        if (!reply) {
            console.log(`Carrinho do usuário ${userId} não encontrado`);
            return res.status(404).json({ mensagem: "Carrinho não encontrado" });
        }

        const carrinho = JSON.parse(reply);
        console.log("Carrinho recuperado:", carrinho); // Log para depuração
        res.status(200).json(carrinho); // Retorna o carrinho completo
    } catch (error) {
        console.error("Erro ao buscar o carrinho:", error);
        res.status(500).send("Erro ao buscar o carrinho");
    }
});

// Configuração da porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
