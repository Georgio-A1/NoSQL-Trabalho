const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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
    _id: { type: mongoose.Types.ObjectId },
    authors: { type: Array, default: ["Autor Desconhecido"] },
    average_rating: { type: Number, default: 0 },
    categories: { type: Array, default: ["Geral"] },
    publication_date: { type: String, default: "01-01-1900" },
    cover_image_url: { type: String, default: "" },
    description: { type: String, default: "Sem descrição" },
    publisher: { type: String, default: "Editora desconhecida" },
    stock: { type: Number, default: 10 },
    language: { type: String, default: "pt" },
    page_count: { type: Number, default: 0} ,
    price: { type: Number, default: 0 },
    currency: { type: String, default: "BRL" },
    reviews: { type: Array, default: [] },
    title: { type: String, required: true, default: "Sem título" },
});

const Livro = mongoose.model('Livro', livroSchema);
const JSON_FOLDER = path.join(__dirname, 'json');

const loadDataFromFiles = () => {
    fs.readdir(JSON_FOLDER, (err, files) => {
      if (err) {
        console.log('Erro ao ler o diretório:', err);
        return;
      }
  
      files.forEach(file => {
        const filePath = path.join(JSON_FOLDER, file);
  
        // Verifica se é um arquivo JSON
        if (path.extname(file) === '.json') {
          fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
              console.log(`Erro ao ler o arquivo ${file}:`, err);
              return;
            }
  
            try {
              const jsonData = JSON.parse(data);
              const livrosValidos = jsonData.filter(livro => {
                const titulo = livro.title;
                return titulo != "Sem título";
              });
              // Populando o banco de dados com os dados do arquivo
              if (livrosValidos.length > 0) {
                console.log(livrosValidos[0]);
                Livro.insertMany(livrosValidos)
                    .then(() => console.log(`Dados do arquivo ${file} inseridos no banco de dados`))
                    .catch(err => console.log(`Erro ao inserir dados de ${file}:`, err));
                } else {
                    console.log(`Nenhum livro válido encontrado no arquivo ${file}`);
                }
             } catch (err) {
              console.log(`Erro ao parsear o arquivo ${file}:`, err);
            }
          });
        }
      });
    });
  };

  
// Rota para popular o banco de dados com arquivos JSON
app.get('/api/popula-banco', async (req, res) => {
    loadDataFromFiles();
    res.send('Iniciando o processo de importação de arquivos JSON');
});

// Rota para excluir todos os livros
app.delete('/api/limpa-banco', async (req, res) => {
    try {
        const result = await Livro.deleteMany({}); // Deleta todos os documentos
        console.log(`Total de livros deletados: ${result.deletedCount}`);
        res.status(200).send("Todos os livros foram excluídos.");
    } catch (err) {
        console.error("Erro ao limpar a coleção de livros:", err);
        res.status(500).send("Erro ao limpar a coleção de livros.");
    }
});

// Conectar ao PostgreSQL
const pool = new Pool({
    user: 'postgres',        // Seu usuário do PostgreSQL
    host: 'localhost',
    database: 'livros',      // Nome do banco de dados
    password: 'mitch',      // Senha do banco de dados
    port: 5432,                 // Porta do PostgreSQL
});

// Rota para obter todos os livros
app.get('/api/livros', async (req, res) => {
    //console.log('Requisição recebida para obter todos os livros');
    try {
        // Removido o log que imprimia todos os livros
        const livros = await Livro.find({ title: { $ne: "Sem título" } });
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
        const mongoId = new mongoose.Types.ObjectId(id)
        const livro = await Livro.findOne({_id: mongoId});
        console.log(mongoId);
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

// Rota para formar o pedido
app.post('/api/finalizar', async (req, res) => {
    console.log("Corpo da requisição para finalizar a compra:", req.body); // Verifique o corpo da requisição
    const { carrinho: { itens, totalItens, totalPreco }, usuarioLogado: { id, email } } = req.body;
    try {
        const resultPedidos = await pool.query('INSERT INTO Pedidos (id_cliente, valor_total) VALUES ($1, $2) RETURNING id_pedido', [id, totalPreco]);
        const id_pedido = resultPedidos.rows[0].id_pedido;
        itens.forEach( async (item) => {
            const resultItensPedidos = 
            await pool.query(`
                INSERT INTO ItensPedidos (id_pedido, id_produto, quantidade, valor_unitario, valor_total) 
                VALUES ($1, $2, $3, $4, $5)`, 
                [id_pedido, item.idProduto, item.quantidade, item.preco, totalPreco]);  
        });
      
        console.log("Pedido bem-sucedido para:", email);
        res.status(200).json({
            id: id,
            email: email,
        });
    } catch (err) {
        console.error('Erro ao finalizar a compra:', err);
        res.status(500).send("Erro ao finalizar a compra");
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
                fotoProduto: livro.cover_image_url,
                titulo: livro.title,
                preco: livro.price,
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

// Rota para adicionar um livro ao carrinho
app.delete('/api/carrinho/:userId', async (req, res) => {
    const { userId } = req.params;  // Obtém o userId da URL
        
    let carrinho = { itens: [], totalItens: 0, totalPreco: 0 };

    try {        
        // Salva o carrinho no Redis
        await redisClient.set(`carrinho:${userId}`, JSON.stringify(carrinho));  // Usando async/await no lugar do callback
        res.status(204).send("Carrinho deletado com sucesso");  // Retorna o carrinho atualizado
    } catch (error) {
        res.status(500).send("Erro ao excluir o carrinho");
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
