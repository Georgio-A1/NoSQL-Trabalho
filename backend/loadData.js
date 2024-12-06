const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const mongoUri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
const mongoOptions = {
    user: process.env.MONGO_USERNAME,
    pass: process.env.MONGO_PASSWORD,
    dbName: process.env.MONGO_DB_NAME
};

const loadDataToMongo = async () => {
    try {
        // Ler o aquivo Json
        const data = JSON.parse(fs.readFileSync('./livros_db.livros.json', 'utf8'));
        console.log('Datos leídos desde el archivo JSON.');

        // Definir o esquema e o modelo de Mongoose
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

        const MyModel = mongoose.model('Livro', livroSchema);

        // Conectar ao MongoDB
        await mongoose.connect(mongoUri, mongoOptions);
        console.log('Conexión a MongoDB establecida.');

        // Insertar os datos em MongoDB
        await MyModel.insertMany(data);
        console.log('Datos cargados exitosamente a MongoDB');
    } catch (error) {
        console.error('Error al cargar datos:', error);
    } finally {
        // Desconectar do MongoDB
        await mongoose.disconnect();
        console.log('Conexión a MongoDB cerrada.');
    }
};

loadDataToMongo();
