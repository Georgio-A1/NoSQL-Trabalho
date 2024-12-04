const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Pool } = require('pg');
const { createClient } = require('@redis/client');

// Configurações do app
const app = express();
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/livros_db', {})
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB', err));

// Conectar ao Redis
const redisClient = createClient({
    socket: {
        host: 'localhost', 
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

// Rota para obter livros com paginação
app.get('/api/livros', async (req, res) => {
    const { page = 1, limit = 5, categoria = '' } = req.query; // Default
    const skip = (page - 1) * limit; // Pular livros com base na página

    try {
        // Filtrar por categoria (se fornecido)
        const filtro = categoria ? { categorias: categoria } : {};

        // Obter os livros da página atual
        const livros = await Livro.find(filtro)
            .skip(Number(skip))
            .limit(Number(limit));

        // Contar o total de livros para calcular o número total de páginas
        const totalLivros = await Livro.countDocuments(filtro);
        const totalPaginas = Math.ceil(totalLivros / limit);

        res.json({
            livros,
            totalPaginas,
        });
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
    console.log("Corpo da requisição de login:", req.body); // Corpo da requisição
    const { email, senha } = req.body;
    console.log('Tentando login para:', email); // Log de depuração
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
    const { userId } = req.params;
    const { idProduto, quantidade } = req.body;

    try {
        const livro = await Livro.findById(idProduto);
        if (!livro) {
            return res.status(404).send("Livro não encontrado");
        }

        // Verificar se há estoque suficiente
        if (livro.estoque < quantidade) {
            return res.status(400).send("Estoque insuficiente");
        }

        // Recuperar o carrinho do Redis
        const reply = await redisClient.get(`carrinho:${userId}`);
        let carrinho = reply ? JSON.parse(reply) : { itens: [], totalItens: 0, totalPreco: 0 };

        const livroExistente = carrinho.itens.find(item => item.idProduto === idProduto);
        if (livroExistente) {
            livroExistente.quantidade += quantidade;
        } else {
            carrinho.itens.push({
                idProduto: livro._id,
                titulo: livro.titulo,
                preco: livro.preco,
                quantidade: quantidade
            });
        }

        // Recalcular totais
        carrinho.totalItens = carrinho.itens.reduce((total, item) => total + item.quantidade, 0);
        carrinho.totalPreco = carrinho.itens.reduce((total, item) => total + item.preco * item.quantidade, 0);

        // Salvar o carrinho no Redis
        await redisClient.set(`carrinho:${userId}`, JSON.stringify(carrinho));

        res.status(200).json(carrinho);
    } catch (error) {
        console.error("Erro ao adicionar livro ao carrinho:", error);
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
        res.status(200).json(carrinho); // Retorna o carrinho
    } catch (error) {
        console.error("Erro ao buscar o carrinho:", error);
        res.status(500).send("Erro ao buscar o carrinho");
    }
});

// Rota para remover um item específico do carrinho
app.delete('/api/carrinho/:userId/remover/:idProduto', async (req, res) => {
    const { userId, idProduto } = req.params;
    const { quantidade } = req.body;  // A quantidade a ser removida

    try {
        // Recupera o carrinho do Redis
        const reply = await redisClient.get(`carrinho:${userId}`);
        if (!reply) {
            console.log(`Carrinho do usuário ${userId} não encontrado`);
            return res.status(404).json({ mensagem: "Carrinho não encontrado" });
        }

        let carrinho = JSON.parse(reply);
        const itemIndex = carrinho.itens.findIndex(item => item.idProduto === idProduto);

        if (itemIndex === -1) {
            return res.status(404).json({ mensagem: "Produto não encontrado no carrinho" });
        }

        const item = carrinho.itens[itemIndex];

        if (item.quantidade <= quantidade) {
            // Se a quantidade a ser removida for maior ou igual à quantidade no carrinho, remove o item
            carrinho.itens.splice(itemIndex, 1);
        } else {
            // Se não, apenas diminui a quantidade do item
            item.quantidade -= quantidade;
        }

        // Recalcula os totais
        carrinho.totalItens = carrinho.itens.reduce((total, item) => total + item.quantidade, 0);
        carrinho.totalPreco = carrinho.itens.reduce((total, item) => total + item.preco * item.quantidade, 0);

        // Salva o carrinho atualizado no Redis
        await redisClient.set(`carrinho:${userId}`, JSON.stringify(carrinho));

        res.status(200).json(carrinho);  // Retorna o carrinho atualizado
    } catch (error) {
        console.error("Erro ao remover item do carrinho:", error);
        res.status(500).send("Erro ao remover item do carrinho");
    }
});

// Rota para remover todos os itens do carrinho
app.delete('/api/carrinho/:userId/remover-todos', async (req, res) => {
    const { userId } = req.params;

    try {
        // Recupera o carrinho do Redis
        const reply = await redisClient.get(`carrinho:${userId}`);
        if (!reply) {
            console.log(`Carrinho do usuário ${userId} não encontrado`);
            return res.status(404).json({ mensagem: "Carrinho não encontrado" });
        }

        let carrinho = JSON.parse(reply);

        // Limpa todos os itens do carrinho
        carrinho.itens = [];
        carrinho.totalItens = 0;
        carrinho.totalPreco = 0;

        // Salva o carrinho vazio no Redis
        await redisClient.set(`carrinho:${userId}`, JSON.stringify(carrinho));

        res.status(200).json(carrinho);  // Retorna o carrinho vazio
    } catch (error) {
        console.error("Erro ao remover todos os itens do carrinho:", error);
        res.status(500).send("Erro ao remover todos os itens do carrinho");
    }
});

// Rota para finalizar a compra
app.post('/api/finalizar-compra/:userId', async (req, res) => {
    const { userId } = req.params;
    const { itensCompra, metodoPagamento } = req.body; // Incluindo o método de pagamento

    console.log("Método de pagamento recebido:", metodoPagamento); // Verificando se o valor está correto

    try {
        // 1. Calcular o valor total do pedido a partir do carrinho
        let valorTotal = 0;
        for (const item of itensCompra) {
            const livro = await Livro.findById(item.idProduto);
            if (!livro) {
                return res.status(404).send(`Livro com ID ${item.idProduto} não encontrado`);
            }

            if (livro.estoque < item.quantidade) {
                return res.status(400).send(`Estoque insuficiente para o livro: ${livro.titulo}`);
            }

            if (!livro.preco || isNaN(livro.preco)) {
                return res.status(400).send(`Preço inválido para o livro: ${item.idProduto}`);
            }

            valorTotal += livro.preco * item.quantidade; // Cálculo do valor total
        }

        // Verificar se o valorTotal é um número válido
        if (isNaN(valorTotal) || valorTotal <= 0) {
            return res.status(400).send("Valor total do pedido é inválido.");
        }

        // 2. Criar o pedido na tabela 'Pedidos'
        const result = await pool.query(
            'INSERT INTO Pedidos (id_cliente, valor_total, metodo_pagamento) VALUES ($1, $2, $3) RETURNING id_pedido',
            [userId, valorTotal, metodoPagamento]  // Incluindo o método de pagamento
        );

        const idPedido = result.rows[0].id_pedido;

        // 3. Criar os itens do pedido na tabela 'ItensPedidos'
        for (const item of itensCompra) {
            const livro = await Livro.findById(item.idProduto);
            if (!livro || !livro.preco || isNaN(livro.preco)) {
                return res.status(400).send(`Valor unitário inválido para o livro: ${item.idProduto}`);
            }

            const valorTotalItem = livro.preco * item.quantidade;

            // Inserir o item do pedido
            await pool.query(
                'INSERT INTO ItensPedidos (id_pedido, id_produto, quantidade, valor_unitario, valor_total) VALUES ($1, $2, $3, $4, $5)',
                [idPedido, item.idProduto, item.quantidade, livro.preco, valorTotalItem]
            );

            // 4. Atualizar o estoque do livro no MongoDB
            const novoEstoque = livro.estoque - item.quantidade;
            if (novoEstoque < 0) {
                return res.status(400).send(`Estoque insuficiente para o livro: ${livro.titulo}`);
            }

            // Atualizando o estoque no MongoDB
            await Livro.findByIdAndUpdate(item.idProduto, { estoque: novoEstoque });
        }

        // 5. Limpar o carrinho após a compra
        await redisClient.del(`carrinho:${userId}`);

        // 6. Retornar o ID do pedido criado
        res.status(200).json({ id_pedido: idPedido });
    } catch (error) {
        console.error("Erro ao finalizar a compra:", error);
        res.status(500).send("Erro ao finalizar a compra");
    }
});

app.get('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await pool.query('SELECT * FROM Clientes WHERE id_cliente = $1', [id]);
        if (cliente.rows.length === 0) {
            return res.status(404).send("Cliente não encontrado");
        }
        res.json(cliente.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar cliente', err);
        res.status(500).send("Erro ao buscar cliente");
    }
});

app.get('/api/historico/:userId', async (req, res) => {
    const { userId } = req.params;

    // Verifique se o usuário está autenticado (verifique token ou sessão)
    if (!userId) {
        console.log('Usuário não autenticado, retornando erro 401');
        return res.status(401).json({ error: "Usuário não autenticado" });
    }

    console.log('Recebendo requisição para histórico do usuário:', userId);

    try {
        const pedidosResult = await pool.query('SELECT * FROM Pedidos WHERE id_cliente = $1 ORDER BY data DESC', [userId]);

        if (pedidosResult.rows.length === 0) {
            console.log('Nenhum pedido encontrado');
            return res.status(404).json({ error: "Nenhum pedido encontrado" });
        }

        const pedidosComItens = await Promise.all(pedidosResult.rows.map(async (pedido) => {
            const itensResult = await pool.query('SELECT * FROM ItensPedidos WHERE id_pedido = $1', [pedido.id_pedido]);

            const itensComLivros = await Promise.all(itensResult.rows.map(async (item) => {
                const livro = await Livro.findById(item.id_produto); // Consultando o MongoDB
                return livro ? { ...item, livro } : { ...item, livro: null };
            }));

            return { ...pedido, itens: itensComLivros };
        }));

        res.json(pedidosComItens);
    } catch (err) {
        console.error('Erro ao buscar histórico de compras', err);
        res.status(500).json({ error: "Erro ao buscar histórico de compras" });
    }
});

// Configuração da porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

