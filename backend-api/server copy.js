// backend/server.js

const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser'); // Removido: express.json() já faz o trabalho
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

// Função assíncrona para conectar ao banco de dados e verificar/criar a tabela de usuários
async function connectToDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
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
        // O servidor não deve iniciar sem uma conexão válida.
        process.exit(1); 
    }
}


// --- Rotas da API (Endpoints) ---

// Exemplo: Rota de Teste para verificar se a API está online
app.get('/', (req, res) => {
    res.send('API RBMC está funcionando!');
});

// Rota para Buscar Pesquisadoras
app.get('/api/buscar-pesquisadoras', async (req, res) => {
    const nomePesquisadora = req.query.nome;

    if (!nomePesquisadora) {
        return res.status(400).json({ message: 'O parâmetro "nome" é obrigatório para a busca.' });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT nome, area, email, instituicao, localidade, link_lattes FROM pesquisadoras WHERE nome LIKE ?',
            [`%${nomePesquisadora}%`]
        );
        res.json(rows);
    } catch (error) {
        console.error('Backend: Erro ao executar a consulta SQL para buscar pesquisadoras:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar pesquisadoras.' });
    }
});


// --- ROTAS DE AUTENTICAÇÃO (LOGIN E REGISTRO) ---
// Estas rotas foram movidas de 'routes/authRoutes.js' para cá.
// Certifique-se de que seu frontend chama /auth/register e /auth/login.

// Rota de Registro de Usuário
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    // 1. Validação básica
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 2. Verificar se o usuário já existe
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Usuário com este e-mail já existe.' });
        }

        // 3. Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Inserir novo usuário no banco de dados
        const [result] = await pool.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        // 5. Gerar um token JWT para login automático após o registro
        const payload = {
            user: {
                id: result.insertId // ID do usuário recém-criado
            }
        };
        // process.env.JWT_SECRET DEVE estar definido no seu arquivo .env
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuário registrado com sucesso!', token });

    } catch (err) {
        console.error('Backend: Erro no registro de usuário:', err.message);
        // Sempre retorne JSON em caso de erro
        res.status(500).json({ message: 'Erro no servidor durante o registro.', details: err.message });
    }
});

// Rota de Login de Usuário
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Validação básica
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 2. Buscar o usuário pelo e-mail
        const [users] = await pool.execute('SELECT id, email, password FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Usuário não existe.' }); // Email não encontrado
        }

        // 3. Comparar a senha fornecida com a senha hash do banco de dados
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Senha inválida.' }); // Senha não corresponde
        }

        // 4. Gerar token JWT (se as credenciais estiverem corretas)
        const payload = {
            user: {
                id: user.id
            }
        };
        // process.env.JWT_SECRET DEVE estar definido no seu arquivo .env
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login bem-sucedido!', token });

    } catch (err) {
        console.error('Backend: Erro no login de usuário:', err.message);
        // Sempre retorne JSON em caso de erro
        res.status(500).json({ message: 'Erro no servidor durante o login.', details: err.message });
    }
});

app.get('/api/pesquisadoras/email/:email', async (req, res) => {
    const emailToSearch = req.params.email; // Pega o e-mail da URL

    if (!emailToSearch) {
        return res.status(400).json({ message: 'E-mail não fornecido.' });
    }

    try {
        // Consulta no MySQL: Seleciona os campos 'nome', 'email', 'raca', 'genero'
        // da tabela 'pesquisadoras' onde o 'email' corresponde
        const [results] = await pool.execute(
            'SELECT nome, email, raca, genero FROM pesquisadoras WHERE email = ?',
            [emailToSearch]
        );
        
        const pesquisadora = results[0]; // Pega o primeiro resultado

        if (!pesquisadora) {
            // Se não encontrar, retorna 404 (Não Encontrado)
            return res.status(404).json({ message: 'Pesquisadora não encontrada com este e-mail.' });
        }

        // Retorna os dados da pesquisadora encontrados
        // Exemplo: { nome: "Maria Silva", email: "maria@exemplo.com", raca: "parda", genero: "feminino" }
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