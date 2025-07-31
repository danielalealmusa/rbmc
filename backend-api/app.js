require('dotenv').config(); // Carrega as variáveis do .env

const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise'); // Usamos a versão com promises

const app = express();
const port = 3000;
const saltRounds = 10; // Custo do hash para bcrypt. 10-12 é um bom ponto de partida.

// Middleware para parsear JSON no corpo das requisições (para POST)
app.use(express.json());

// --- Configuração do Banco de Dados ---
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

// Função auxiliar para obter conexão com o banco de dados
async function getConnection() {
    try {
        return await mysql.createConnection(dbConfig);
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error.message);
        throw new Error('Falha na conexão com o banco de dados.');
    }
}

// --- Rota de Registro (Cadastro de Usuário) ---
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const connection = await getConnection();

        try {
            const [result] = await connection.execute(
                'INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)',
                [email, hashedPassword]
            );
            console.log(`Usuário ${email} registrado com sucesso. ID: ${result.insertId}`);
            res.status(201).json({ message: 'Usuário registrado com sucesso!' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Este email já está cadastrado.' });
            }
            console.error('Erro ao inserir usuário:', error.message);
            res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
        } finally {
            await connection.end(); // Fechar a conexão
        }

    } catch (error) {
        console.error('Erro durante o registro:', error.message);
        res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
    }
});

// --- Rota de Login ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const connection = await getConnection();
        let user = null;

        try {
            const [rows] = await connection.execute(
                'SELECT id, email, senha_hash FROM usuarios WHERE email = ?',
                [email]
            );
            user = rows[0]; // Pega o primeiro usuário encontrado (deve ser único)
        } finally {
            await connection.end(); // Fechar a conexão
        }

        if (!user) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' }); // Não revela se é o email ou a senha
        }

        const isPasswordValid = await bcrypt.compare(password, user.senha_hash);

        if (isPasswordValid) {
            console.log(`Login bem-sucedido para o usuário: ${email}`);
            // Em uma aplicação real, aqui você geraria e retornaria um token de autenticação (JWT)
            res.status(200).json({ message: 'Login bem-sucedido!', user: { id: user.id, email: user.email } });
        } else {
            console.log(`Tentativa de login falhou para o usuário: ${email}`);
            res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

    } catch (error) {
        console.error('Erro durante o login:', error.message);
        res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
    }
});

// --- Iniciar o Servidor ---
app.listen(port, () => {
    console.log(`Servidor Node.js rodando em http://localhost:${port}`);
    console.log(`Para registrar: POST http://localhost:${port}/register com { "email": "seu_email@example.com", "password": "sua_senha_segura" }`);
    console.log(`Para fazer login: POST http://localhost:${port}/login com { "email": "seu_email@example.com", "password": "sua_senha_segura" }`);
});