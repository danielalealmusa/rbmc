// backend/server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Para parsear o corpo das requisições JSON
const dotenv = require('dotenv');
const mysql = require('mysql2/promise'); // Driver MySQL com suporte a promessas
const bcrypt = require('bcryptjs');     // Para hash de senhas
const jwt = require('jsonwebtoken');    // Para tokens de autenticação
const path = require('path');           // Para lidar com caminhos (se precisar no futuro)

// Carrega as variáveis de ambiente do arquivo .env
// Note: `require('dotenv').config();` já faz isso, então você pode remover `dotenv = require('dotenv');`
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Porta do servidor

// Configurar Middlewares Globais
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500' // URL do seu frontend para CORS
}));
app.use(express.json()); // Habilita o Express a parsear JSON do corpo das requisições
app.use(bodyParser.json()); // redundante se já usando express.json() mas não causa problema


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

let pool; // Variável global para o pool de conexões

// Função assíncrona para conectar ao banco de dados ao iniciar o servidor
async function connectToDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Backend: Conectado ao banco de dados MySQL com sucesso!');

        // Opcional: Testar se a tabela 'users' existe, se não, criar (apenas para desenvolvimento)
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
        console.error('Backend: Erro ao conectar ou verificar o banco de dados:', error.message);
        process.exit(1); // Encerra o processo se a conexão falhar criticamente
    }
}

connectToDatabase(); // Chama a função para conectar ao DB ao iniciar o script
// --- FIM da Configuração MySQL ---


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

        // Opcional: Gerar um token JWT para login automático após o registro
        const payload = {
            user: {
                id: result.insertId // ID do usuário recém-criado
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuário registrado com sucesso!', token });

    } catch (err) {
        console.error('Backend: Erro no registro de usuário:', err.message);
        res.status(500).json({ message: 'Erro no servidor durante o registro.' });
    }
});





// 7. Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
    console.log(`Frontend URL permitida (CORS): ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
});