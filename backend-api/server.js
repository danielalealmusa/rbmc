// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise'); // Driver MySQL com suporte a promessas
const bcrypt = require('bcryptjs');     // Para hash de senhas
const jwt = require('jsonwebtoken');    // Para tokens de autenticação
const path = require('path');           // Mantido, mas não usado diretamente neste snippet



// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();



const PORT = process.env.PORT || 3000; // Porta do servidor

// --- Configurar Middlewares Globais (sempre no início) ---
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500' // URL do seu frontend para CORS
}));
app.use(express.json()); // Habilita o Express a parsear JSON do corpo das requisições

// --- Configuração da Conexão com o Banco de Dados MySQL (Pool de Conexões) ---
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool; // Variável global para o pool de conexões MySQL

// Função assíncrona para conectar ao banco de dados e verificar/criar as tabelas
async function connectToDatabase() {
    try {
        pool = mysql.createPool(dbConfig); // INICIALIZAÇÃO DO POOL
        // Tenta pegar uma conexão do pool para verificar se a conexão foi bem-sucedida
        await pool.getConnection();
        console.log('Backend: Conectado ao banco de dados MySQL com sucesso!');

        // Cria a tabela 'users' se ela não existir
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Backend: Tabela `users` verificada/criada.');

       

    } catch (error) {
        console.error('Backend: ERRO CRÍTICO ao conectar ou verificar o banco de dados:', error.message);
        // Encerra o processo do Node.js se a conexão com o DB falhar.
        process.exit(1); 
    }
}


// --- Rotas da API (Endpoints) ---

// Exemplo: Rota de Teste para verificar se a API está online
app.get('/', (req, res) => {
    res.send('API RBMC está funcionando!');
});

// Rota para Buscar Pesquisadoras por Nome (para sua funcionalidade de busca geral)
app.get('/api/buscar-pesquisadoras', async (req, res) => {
    const nomePesquisadora = req.query.nome;

    if (!nomePesquisadora) {
        return res.status(400).json({ message: 'O parâmetro "nome" é obrigatório para a busca.' });
    }

    try {
        // Ajuste esta consulta se os nomes das colunas forem diferentes
        const [rows] = await pool.execute(
            'SELECT nome, email FROM pesquisadoras WHERE nome LIKE ?', // Exemplo com nome e email
            [`%${nomePesquisadora}%`]
        );
        res.json(rows);
    } catch (error) {
        console.error('Backend: Erro ao executar a consulta SQL para buscar pesquisadoras por nome:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar pesquisadoras.' });
    }
});

  


// --- ROTAS DE AUTENTICAÇÃO (LOGIN E REGISTRO) ---
// Rota de Registro de Usuário
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Usuário com este e-mail já existe.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        const payload = { user: { id: result.insertId } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuário registrado com sucesso!', token });

    } catch (err) {
        console.error('Backend: Erro no registro de usuário:', err.message);
        res.status(500).json({ message: 'Erro no servidor durante o registro.', details: err.message });
    }
});

// Rota de Login de Usuário
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const [users] = await pool.execute('SELECT id, email, password FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Usuário não existe.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login bem-sucedido!', token, userEmail: user.email }); // Incluindo userEmail na resposta

    } catch (err) {
        console.error('Backend: Erro no login de usuário:', err.message);
        res.status(500).json({ message: 'Erro no servidor durante o login.', details: err.message });
    }
});

// --- ROTA CRÍTICA PARA BUSCAR DADOS COMPLETOS DA PESQUISADORA POR E-MAIL ---
// Esta é a rota que seu frontend na dados-pessoais.html está esperando
app.get('/api/buscar-pesquisadoras/email/:email', async (req, res) => {
    const emailToSearch = req.params.email; // Pega o e-mail da URL
     console.log('Buscando pesquisadora com email:', req.params.email);

    if (!emailToSearch) {
        return res.status(400).json({ message: 'E-mail não fornecido.' });
    }

    try {
        // Selecione TODAS as colunas que você quer retornar para o formulário
        const [results] = await pool.execute(
            `SELECT 
                *
                
            FROM pesquisadoras 
            WHERE email = ?`,
            [emailToSearch]
        );
        
        const pesquisadora = results[0]; // Pega o primeiro resultado

        if (!pesquisadora) {
            return res.status(404).json({ message: 'Pesquisadora não encontrada com este e-mail.' });
        }

        // Retorna todos os dados da pesquisadora encontrados
        res.status(200).json(pesquisadora); 

    } catch (err) {
        console.error('Backend: Erro ao buscar pesquisadora por e-mail:', err.message);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar dados da pesquisadora.', details: err.message });
    }
});



// --- Middlewares de Tratamento de Erros e 404 (SEMPRE POR ÚLTIMO) ---

// Middleware para rotas não encontradas (404)
app.use((req, res) => {
    console.log(`Backend: Rota não encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Rota da API não encontrada.' });
});

// Middleware de tratamento de erros gerais (500)
app.use((err, req, res, next) => {
    console.error('Backend: Erro geral do servidor:', err.stack); // Log completo do erro
    res.status(500).json({ message: 'Erro interno do servidor.', error: err.message });
});


// --- Iniciar o Servidor ---
// Apenas inicia o servidor Express APÓS a conexão bem-sucedida com o banco de dados.
async function startServer() {
    await connectToDatabase(); // Aguarda a conexão com o DB
    app.listen(PORT, () => {
        console.log(`Servidor backend rodando em http://localhost:${PORT}`);
        console.log(`Frontend URL permitida (CORS): ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
    });
}

startServer(); // Chama a função para iniciar o servidor