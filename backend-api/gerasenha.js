// backend/generate_password_hash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
    const defaultPassword = 'rbmc2025'; // <-- MUITO IMPORTANTE: Escolha uma senha forte!
    const saltRounds = 10; // Custo do hash, 10 é um bom valor padrão

    try {
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
        console.log('Senha Padrão:', defaultPassword);
        console.log('Hash Gerado:', hashedPassword);
    } catch (error) {
        console.error('Erro ao gerar o hash:', error);
    }
}

generateHash();