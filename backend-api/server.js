

const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser'); // Removido: express.json() já faz o trabalho
const dotenv = require('dotenv');
const mysql = require('mysql2/promise'); // Driver MySQL com suporte a promessas
const bcrypt = require('bcryptjs');     // Para hash de senhas
const jwt = require('jsonwebtoken');    // Para tokens de autenticação
const path = require('path');           // Mantido, mas não usado diretamente neste snippet

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();
app.use(express.static(path.join(__dirname, 'frontend-app')));
const app = express();
const PORT = process.env.PORT || 3000; // Porta do servidor

app.use(express.urlencoded({ extended: true })); 

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



// CORREÇÃO: Adicionei a verificação da tabela 'apoiadoras' para garantir que ela exista.
await pool.execute(`
CREATE TABLE IF NOT EXISTS apoiadoras (
    id SERIAL PRIMARY KEY,
    pFullName VARCHAR(255) NULL,
    pContactEmail VARCHAR(255) NULL,
    pEmailPublic VARCHAR(10) NULL,
    pContactPhone VARCHAR(20) NULL,
    pPhonePublic VARCHAR(10) NULL,
    pBirthDate DATE NULL,
    pNationality VARCHAR(20) NULL,
    pStateResidence VARCHAR(50) NULL,
    pCityResidence VARCHAR(100) NULL,
    pEthnicity VARCHAR(50) NULL,
    pGender VARCHAR(50) NULL,
    pGenderOtherText TEXT NULL,
    pPcd VARCHAR(10) NULL,
    pDeficiencies TEXT NULL,
    pHighestEducation VARCHAR(50) NULL,
    pEducationState VARCHAR(50) NULL,
    pEducationIES VARCHAR(255) NULL,
    pKeywordInput TEXT NULL,
    pInclusionProgram VARCHAR(50) NULL,
    pOtherInclusionText TEXT NULL,
    pFinancialAid TEXT NULL,
    pLattesLink VARCHAR(255) NULL,
    pProfessionalRole VARCHAR(50) NULL,
    pDocenteWorkState VARCHAR(255) NULL,
    pHouseholdMembers VARCHAR(20) NULL,
    pHasChildren VARCHAR(20) NULL,
    pIsCaregiver VARCHAR(20) NULL,
    pEconomicActiveMembers VARCHAR(20) NULL,
    pFamilyIncome VARCHAR(50) NULL,
    pParticipateStem VARCHAR(10) NULL,
    pParticipateSocial VARCHAR(20) NULL,
    pChallenges TEXT NULL,
    pGenderViolence TEXT NULL
);

`);
console.log('Backend: Tabela `apoiadoras` verificada/criada.');

  await pool.execute(`
            CREATE TABLE IF NOT EXISTS pesquisadoras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pfull_name VARCHAR(255) NOT NULL,
                pcontact_email VARCHAR(255) NOT NULL,
                pemail_public BOOLEAN,
                pcontact_phone VARCHAR(20) NOT NULL,
                pphone_public BOOLEAN,
                pbirth_date DATE NOT NULL,
                pnationality VARCHAR(50) NOT NULL,
                pstate_residence VARCHAR(100) NOT NULL,
                pcity_residence VARCHAR(100) NOT NULL,
                pethnicity VARCHAR(50) NOT NULL,
                pgender VARCHAR(50) NOT NULL,
                pgender_other_text TEXT,
                pis_pcd BOOLEAN NOT NULL,
                pdeficiencies TEXT,
                preceive_contact BOOLEAN,
                pno_info_rbmc BOOLEAN,
                phighest_education VARCHAR(50) NOT NULL,
                peducation_state VARCHAR(100) NOT NULL,
                peducation_ies VARCHAR(255) NOT NULL,
                pcourse_area VARCHAR(100) NOT NULL,
                pcourse_name VARCHAR(255) NOT NULL,
                pkeywords JSON,
                pinclusion_program VARCHAR(50) NOT NULL,
                pother_inclusion_text TEXT,
                pfinancial_aid JSON,
                plattes_link VARCHAR(255),
                ppublications JSON,
                pprofessional_role VARCHAR(100) NOT NULL,
                pdocente_work_state VARCHAR(100),
                pdocente_department VARCHAR(255),
                ppesquisadora_work_state VARCHAR(100),
                ppesquisadora_role VARCHAR(255),
                pstudent_study_state VARCHAR(100),
                ppg_type VARCHAR(50),
                ppg_area VARCHAR(100),
                ppg_program_name VARCHAR(255),
                pnot_researcher_reason VARCHAR(100),
                pnot_working_reason VARCHAR(100),
                pnot_working_other_reason_text TEXT,
                phousehold_members VARCHAR(50) NOT NULL,
                phas_children BOOLEAN NOT NULL,
                pis_caregiver BOOLEAN NOT NULL,
                peconomic_active_members VARCHAR(50) NOT NULL,
                pfamily_income VARCHAR(50) NOT NULL,
                pparticipate_stem BOOLEAN NOT NULL,
                pparticipate_social BOOLEAN NOT NULL,
                pchallenges JSON,
                pgender_violence JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Backend: Tabela `pesquisadoras` verificada/criada.');
await pool.execute(`
    CREATE TABLE IF NOT EXISTS colaboradoras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pFullName VARCHAR(255),
    pContactEmail VARCHAR(255) ,
    pContactPhone VARCHAR(50),
    pEmailPublic BOOLEAN DEFAULT FALSE,
    pPhonePublic BOOLEAN DEFAULT FALSE,
    pBirthDate DATE,
    pNationality VARCHAR(100),
    pStateResidence VARCHAR(100),
    pCityResidence VARCHAR(100),
    pEthnicity VARCHAR(100),
    pGender VARCHAR(100),
    pGenderOtherText VARCHAR(255),
    pPcd BOOLEAN DEFAULT FALSE,
    pDeficiencies TEXT,
    pIsCurrentlyWorking BOOLEAN DEFAULT FALSE,
    profissaoAtual VARCHAR(255),
    pNotWorkingReason TEXT,
    pLattesLink VARCHAR(255),
    pHighestEducation VARCHAR(255),
    detalhamentoFormacao TEXT,
    pEducationState VARCHAR(100),
    pKeywordInput JSON,
    pInclusionProgram VARCHAR(255),
    pOtherInclusionText TEXT,
    pFinancialAid JSON,
    pHouseholdMembers VARCHAR(50) ,
    pHasChildren BOOLEAN DEFAULT FALSE,
    pIsCaregiver BOOLEAN DEFAULT FALSE,
    pEconomicActiveMembers VARCHAR(50),
    pFamilyIncome varchar(50),
    pParticipateStem BOOLEAN DEFAULT FALSE,
    pParticipateSocial BOOLEAN DEFAULT FALSE,
    pChallenges JSON,
    pGenderViolence JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

        `);
        console.log('Backend: Tabela `colaboradoras` verificada/criada.');
} catch (error) {
console.error('Backend: ERRO CRÍTICO ao conectar ou verificar o banco de dados:', error.message);
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
    // 1. Recebe todos os parâmetros da URL
    const { nome, area, formacao, estado } = req.query;
const areaMapping = {
        'ciencias_exatas_terra': 'Ciências Exatas e da Terra',
        'ciencias_biologicas': 'Ciências Biológicas',
        'engenharias': 'Engenharias',
        'ciencias_saude': 'Ciências da Saúde',
        'ciencias_agrarias': 'Ciências Agrárias',
        'ciencias_sociais': 'Ciências Sociais',
        'ciencias_humanas_linguistica': 'Ciências Humanas',
        'letras': 'Linguística, Letras e Artes',
        'artes': 'Linguística, Letras e Artes'
    };
    // 2. Define a base da consulta SQL
    let sqlQuery = `
        SELECT nome, area, email, instituicao, localidade, link_lattes 
        FROM pesquisadoras2 
        WHERE modo_de_participacao = 'PARTICIPAR'
    `;
    const params = [];

    // 3. Adiciona as cláusulas WHERE dinamicamente, apenas se o parâmetro existir
    if (nome) {
        sqlQuery += ` AND nome LIKE ?`;
        params.push(`%${nome}%`);
    }

    if (area) {
        // Usa o objeto de mapeamento para obter o valor correto do banco de dados
        const areaBanco = areaMapping[area];
        if (areaBanco) { // Verifica se a área mapeada existe
            sqlQuery += ` AND area LIKE?`;
            params.push((`%${areaBanco}%`));
        }
    }  
    if (estado) {
        sqlQuery += ` AND localidade LIKE ?`; // Assumindo que 'localidade' contém o estado
        params.push(`%${estado}%`);
    }

    // 4. Se nenhum filtro foi passado, retorna um erro ou uma lista vazia
    if (params.length === 0) {
        return res.status(400).json({ message: 'Pelo menos um critério de busca deve ser fornecido.' });
    }

    try {
        // 5. Executa a consulta no banco de dados
        console.log('Consulta SQL gerada:', sqlQuery);
        console.log('Parâmetros da consulta:', params);
        
        const [rows] = await pool.execute(sqlQuery, params);
        res.json(rows);
    } catch (error) {
        console.error('Backend: Erro ao executar a consulta SQL:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar pesquisadoras.' });
    }
});

// CORREÇÃO: Rota POST para salvar apoiadoras usando o pool de conexões.
app.post('/api/apoiadoras', async (req, res) => {
    let connection; // Declara a variável de conexão para o bloco try/finally

try {
// Acessa uma conexão do pool. Isso evita o erro "connection is not defined".
connection = await pool.getConnection();

const { pFullName, pContactEmail, pEmailPublic, pContactPhone, pPhonePublic, 
    pBirthDate, pNationality, pStateResidence, pCityResidence, pEthnicity, pGender, 
    pGenderOtherText, pPcd, pDeficiencies, pHighestEducation,
    pEducationState, pEducationIES, pKeywordInput, pInclusionProgram, 
    pOtherInclusionText, pFinancialAid, pLattesLink, pProfessionalRole, 
    pDocenteWorkState, pHouseholdMembers, pHasChildren, pIsCaregiver, 
    pEconomicActiveMembers, pFamilyIncome, pParticipateStem, 
    pParticipateSocial, pChallenges, pGenderViolence } = req.body;

       const apoiadoraData = {

    // Campos mantidos
    pFullName: pFullName,
    pContactEmail: pContactEmail,
    pEmailPublic: !!pEmailPublic, // Converte 1 para true e 0 para false
    pContactPhone: pContactPhone,
    pPhonePublic: !!pPhonePublic, // Converte 1 para true e 0 para false
    pBirthDate: pBirthDate,
    pNationality: pNationality,
    pStateResidence: pStateResidence,
    pCityResidence: pCityResidence,
    pEthnicity: pEthnicity,
    pGender: pGender,
    pGenderOtherText: pGender === 'outro' ? pGenderOtherText : null,
    pPcd: !!pPcd, // Converte 1 para true e 0 para false
    pDeficiencies: !!pPcd ? pDeficiencies : null,

   

    // Campos de educação mantidos/modificados
    pHighestEducation: pHighestEducation,
    pKeywordInput: pKeywordInput ? JSON.stringify(pKeywordInput) : null,

    // Campos mantidos
    pInclusionProgram: pInclusionProgram,
    pOtherInclusionText: pInclusionProgram === 'outras' ? pOtherInclusionText : null,
    pFinancialAid: pFinancialAid ? JSON.stringify(pFinancialAid) : null,
    pLattesLink: pLattesLink || null,

    // Novos campos de família/renda
    pHouseholdMembers: pHouseholdMembers,

    // Campos mantidos
    pHasChildren: !!pHasChildren, // Converte 1 para true e 0 para false
    pIsCaregiver: !!pIsCaregiver, // Converte 1 para true e 0 para false
    pEconomicActiveMembers: pEconomicActiveMembers,
    pFamilyIncome: pFamilyIncome,
    pParticipateStem: !!pParticipateStem, // Converte 1 para true e 0 para false
    pParticipateSocial: !!pParticipateSocial, // Converte 1 para true e 0 para false
    pChallenges: pChallenges ? JSON.stringify(pChallenges) : null,
    pGenderViolence: pGenderViolence ? JSON.stringify(pGenderViolence) : null
};

        // Construir a query SQL dinamicamente
        const columns = Object.keys(apoiadoraData).join(', ');
        const placeholders = Object.keys(apoiadoraData).map(() => '?').join(', ');
        const values = Object.values(apoiadoraData);
        console.log("CAMPOS DA QUERY:", Object.keys(apoiadoraData));
        const query = `
            INSERT INTO rbmc.apoiadoras (${columns})
            VALUES (${placeholders});
        `;

        const [result] = await connection.execute(query, values);

        console.log('Dados de apoiadora salvos com sucesso:', result);
       res.status(201).json({ message: 'Apoiadora cadastrada com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar os dados da apoiadora no banco:', error);

        res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// CORREÇÃO: Rota POST para salvar pesquisadoras usando o pool de conexões.


// Rota POST para salvar dados da página de colaboradoras
app.post('/api/colaboradoras', async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();

        // Extrai todos os campos do req.body com o prefixo 'p'
        const {
            pConsent, pFullName, pContactEmail, pEmailPublic, pContactPhone, pPhonePublic, pBirthDate, pNationality, pStateResidence, pCityResidence, pEthnicity, pGender, pGenderOtherText, pPcd, pDeficiencies, pIsCurrentlyWorking, profissaoAtual, pNotWorkingReason, pHighestEducation, detalhamentoFormacao, pEducationState, pKeywordInput, pInclusionProgram, pOtherInclusionText, pFinancialAid, pLattesLink, pHouseholdMembers, pHasChildren, pIsCaregiver, pEconomicActiveMembers, pFamilyIncome, pParticipateStem, pParticipateSocial, pChallenges, pGenderViolence 
        } = req.body;

    
       const colaboradoraData = {

    // Campos mantidos
    pFullName: pFullName,
    pContactEmail: pContactEmail,
    pEmailPublic: !!pEmailPublic, // Converte 1 para true e 0 para false
    pContactPhone: pContactPhone,
    pPhonePublic: !!pPhonePublic, // Converte 1 para true e 0 para false
    pBirthDate: pBirthDate,
    pNationality: pNationality,
    pStateResidence: pStateResidence,
    pCityResidence: pCityResidence,
    pEthnicity: pEthnicity,
    pGender: pGender,
    pGenderOtherText: pGender === 'outro' ? pGenderOtherText : null,
    pPcd: !!pPcd, // Converte 1 para true e 0 para false
    pDeficiencies: !!pPcd ? pDeficiencies : null,

    // Novos campos relacionados ao trabalho
    pIsCurrentlyWorking: !!pIsCurrentlyWorking,
    profissaoAtual: pIsCurrentlyWorking ? profissaoAtual : null,
    pNotWorkingReason: !pIsCurrentlyWorking ? pNotWorkingReason : null,

    // Campos de educação mantidos/modificados
    pHighestEducation: pHighestEducation,
    detalhamentoFormacao: detalhamentoFormacao,
    pEducationState: pEducationState,
    pKeywordInput: pKeywordInput ? JSON.stringify(pKeywordInput) : null,

    // Campos mantidos
    pInclusionProgram: pInclusionProgram,
    pOtherInclusionText: pInclusionProgram === 'outras' ? pOtherInclusionText : null,
    pFinancialAid: pFinancialAid ? JSON.stringify(pFinancialAid) : null,
    pLattesLink: pLattesLink || null,

    // Novos campos de família/renda
    pHouseholdMembers: pHouseholdMembers,

    // Campos mantidos
    pHasChildren: !!pHasChildren, // Converte 1 para true e 0 para false
    pIsCaregiver: !!pIsCaregiver, // Converte 1 para true e 0 para false
    pEconomicActiveMembers: pEconomicActiveMembers,
    pFamilyIncome: pFamilyIncome,
    pParticipateStem: !!pParticipateStem, // Converte 1 para true e 0 para false
    pParticipateSocial: !!pParticipateSocial, // Converte 1 para true e 0 para false
    pChallenges: pChallenges ? JSON.stringify(pChallenges) : null,
    pGenderViolence: pGenderViolence ? JSON.stringify(pGenderViolence) : null
};

        // Construir a query SQL dinamicamente
        const columns = Object.keys(colaboradoraData).join(', ');
        const placeholders = Object.keys(colaboradoraData).map(() => '?').join(', ');
        const values = Object.values(colaboradoraData);
        console.log("CAMPOS DA QUERY:", Object.keys(colaboradoraData));
        const query = `
            INSERT INTO rbmc.colaboradoras (${columns})
            VALUES (${placeholders});
        `;

        const [result] = await connection.execute(query, values);

        console.log('Dados de colaboradora salvos com sucesso:', result);
       res.status(201).json({ message: 'Colaboradora cadastrada com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar os dados da colaboradora no banco:', error);

        res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// Rota POST para salvar dados da página de pesquisadora
app.post('/api/pesquisadoras', async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();

        // Extrai todos os campos do req.body com o prefixo 'p'
        const {
            pFullName, pContactEmail, pEmailPublic, pContactPhone, 
            pPhonePublic, 
            pBirthDate, pNationality, pStateResidence, pCityResidence, pEthnicity,
            pGender, pGenderOtherText, pPcd, pDeficiencies,
            pReceiveContact, pNoInfoRbmc, 
            pHighestEducation, pEducationState, pEducationIES, pCourseArea, pCourseName,
            pKeywords, 
            pInclusionProgram, pOtherInclusionText,
            pFinancialAid, 
            pLattesLink,
            pPublications, 
            pProfessionalRole,
            pDocenteWorkState, pDocenteDepartment,
            pPesquisadoraWorkState, pPesquisadoraRole,
            pStudentStudyState, pPgType, pPgArea, pPgProgramName,
            pNotResearcherReason, pNotWorkingReason, pNotWorkingOtherReasonText, 
            pHouseholdMembers, pHasChildren, pIsCaregiver, pEconomicActiveMembers,
            pFamilyIncome, pParticipateStem, pParticipateSocial,
            pChallenges, 
            pGenderViolence 
        } = req.body;

        // NOVO: Lista de campos obrigatórios para validação
        const requiredFields = [
            'pFullName', 'pContactEmail', 'pContactPhone', 'pBirthDate', 
            'pNationality', 'pStateResidence', 'pCityResidence', 'pEthnicity', 
            'pGender', 'pPcd', 'pHighestEducation', 'pEducationState', 
            'pEducationIES', 'pCourseArea', 'pCourseName', 'pProfessionalRole', 
            'pHouseholdMembers', 'pHasChildren', 'pIsCaregiver', 'pEconomicActiveMembers', 
            'pFamilyIncome', 'pParticipateStem', 'pParticipateSocial'
        ];

       const missingFields = requiredFields.filter(field => {
            const value = req.body[field];
            // Verifica se o valor é undefined, null, ou uma string vazia (após trim)
            // Para arrays (como keywords, publications, financialAid, challenges, genderViolence)
            // verifica se o array está vazio
            if (Array.isArray(value)) {
                return value.length === 0;
            }
            return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
        });

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Campos obrigatórios faltando no formulário de pesquisadora.',
                missing: missingFields 
            });
        }

        // Mapeamento e conversão de dados para o formato do banco de dados
        const pesquisadoraData = {
         
            pfull_name: pFullName,
            pcontact_email: pContactEmail,
          pemail_public: !!pEmailPublic, // Converte 1 para true e 0 para false
    pcontact_phone: pContactPhone,
    pphone_public: !!pPhonePublic, // Converte 1 para true e 0 para false
            pbirth_date: pBirthDate,
            pnationality: pNationality,
            pstate_residence: pStateResidence,
            pcity_residence: pCityResidence,
            pethnicity: pEthnicity,
            pgender: pGender,
            pgender_other_text: pGender === 'outro' ? pGenderOtherText : null,
           pis_pcd: !!pPcd, // Converte 1 para true e 0 para false
    pdeficiencies: !!pPcd ? pDeficiencies : null,
    preceive_contact: !!pReceiveContact, // Converte 1 para true e 0 para false
    pno_info_rbmc: !!pNoInfoRbmc, // Converte 1 para true e 0 para false
            phighest_education: pHighestEducation,
            peducation_state: pEducationState,
            peducation_ies: pEducationIES,
            pcourse_area: pCourseArea,
            pcourse_name: pCourseName,
            pkeywords: pKeywords ? JSON.stringify(pKeywords) : null,
            pinclusion_program: pInclusionProgram,
            pother_inclusion_text: pInclusionProgram === 'outras' ? pOtherInclusionText : null,
            pfinancial_aid: pFinancialAid ? JSON.stringify(pFinancialAid) : null,
            plattes_link: pLattesLink || null,
            ppublications: pPublications ? JSON.stringify(pPublications) : null,
            pprofessional_role: pProfessionalRole,
            // Campos condicionais de atuação profissional
            pdocente_work_state: pProfessionalRole === 'docente_pesquisadora' ? pDocenteWorkState : null,
            pdocente_department: pProfessionalRole === 'docente_pesquisadora' ? pDocenteDepartment : null,
            ppesquisadora_work_state: pProfessionalRole === 'pesquisadora' ? pPesquisadoraWorkState : null,
            ppesquisadora_role: pProfessionalRole === 'pesquisadora' ? pPesquisadoraRole : null,
            pstudent_study_state: pProfessionalRole === 'estudante_pos_graduacao' ? pStudentStudyState : null,
            ppg_type: pProfessionalRole === 'estudante_pos_graduacao' ? pPgType : null,
            ppg_area: pProfessionalRole === 'estudante_pos_graduacao' ? pPgArea : null,
            ppg_program_name: pProfessionalRole === 'estudante_pos_graduacao' ? pPgProgramName : null,
            pnot_researcher_reason: pProfessionalRole === 'atuando_nao_pesquisadora' ? pNotResearcherReason : null,
            pnot_working_reason: pProfessionalRole === 'nao_atuando' ? req.body.pNotWorkingReason : null,
            // pNotWorkingOtherReasonText depende de pNotWorkingReason ser 'other_reasons'
            pnot_working_other_reason_text: (pProfessionalRole === 'nao_atuando' && req.body.pNotWorkingReason === 'other_reasons') ? req.body.pNotWorkingOtherReasonText : null,
            phousehold_members: pHouseholdMembers,
            phas_children: !!pHasChildren, // Converte 1 para true e 0 para false
    pis_caregiver: !!pIsCaregiver, // Converte 1 para true e 0 para false
            peconomic_active_members: pEconomicActiveMembers,
            pfamily_income: pFamilyIncome,
             pparticipate_stem: !!pParticipateStem, // Converte 1 para true e 0 para false
    pparticipate_social: !!pParticipateSocial, // Converte 1 para true e 0 para false
            pchallenges: pChallenges ? JSON.stringify(pChallenges) : null,
            pgender_violence: pGenderViolence ? JSON.stringify(pGenderViolence) : null
        };

        // Construir a query SQL dinamicamente
        const columns = Object.keys(pesquisadoraData).join(', ');
        const placeholders = Object.keys(pesquisadoraData).map(() => '?').join(', ');
        const values = Object.values(pesquisadoraData);
console.log("CAMPOS DA QUERY:", Object.keys(pesquisadoraData));
        const query = `
            INSERT INTO pesquisadoras (${columns})
            VALUES (${placeholders});
        `;

        const [result] = await connection.execute(query, values);

        console.log('Dados de pesquisadora salvos com sucesso:', result);
       res.status(201).json({ message: 'Pesquisadora cadastrada com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar os dados da pesquisadora no banco:', error);
        
        res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// Rota GET para buscar dados do usuário logado
app.get('/api/dados-usuario', async (req, res) => {
    // 1. Obtém o e-mail da query string da URL.
     console.log('1. Requisição recebida para /api/dados-usuario');
    const { email } = req.query;

    // 2. Verifica se o e-mail foi fornecido. Se não, retorna um erro.
    if (!email) {
         console.log('2. Erro: Email não fornecido na query string.');
        return res.status(400).json({ error: 'O email do usuário é obrigatório.' });
    }

    let connection;
    try {
         console.log('3. Tentando criar a conexão com o banco de dados...');
        connection = await mysql.createConnection(dbConfig);
          console.log('4. Conexão com o banco de dados estabelecida com sucesso.');

        // 4. Executa a consulta SQL usando prepared statements.
        console.log('5. Executando a consulta SQL...');
        const [rows] = await connection.execute(
            'SELECT * FROM pesquisadoras WHERE pcontact_email = ?',
            [email]
        );
 console.log('6. Consulta SQL executada. Número de linhas encontradas:', rows.length);
        // 5. Verifica se encontrou o usuário e retorna os dados ou um erro.
        if (rows.length > 0) {
            res.json(rows[0]); // Retorna o primeiro registro.
        } else {
            res.status(404).json({ error: 'Nenhum dado encontrado para este usuário.' });
        }

    } catch (error) {
        // 6. Trata erros de conexão ou consulta.
        console.error('Erro ao buscar dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        // 7. Garante que a conexão seja fechada.
        if (connection) connection.end();
    }
});

app.put('/api/update-profile', async (req, res) => {
 try{   
        const {
            email,
            pFullName,
            pContactEmail,
            pContactPhone,
            pBirthDate,
            pEthnicity,
            pGender,
            pNationality,
            pStateResidence,
            pCityResidence,
            pInclusionProgram,
            pFinancialAid,
            pLattesLink,
            pProfessionalRole,
            pHouseholdMembers,
            pHasChildren,
            pIsCaregiver,
            pEconomicActiveMembers,
            pFamilyIncome,
            // ... (outros campos)
        } = req.body;

        // A CORREÇÃO ESTÁ AQUI: Convertendo o array para uma string JSON
        const financialAidJson = JSON.stringify(pFinancialAid);
let connection;
   
         console.log('3. Tentando criar a conexão com o banco de dados...');
        connection = await mysql.createConnection(dbConfig);
          console.log('4. Conexão com o banco de dados estabelecida com sucesso.');

      const hasChildrenInt = pHasChildren === 'sim' ? 1 : 0;
        const isCaregiverInt = pIsCaregiver === 'sim' ? 1 : 0;


        const [results] = await connection.execute(
            `
            UPDATE pesquisadoras
            SET
                pfull_name = ?,
                pcontact_email = ?,
                pcontact_phone = ?,
                pbirth_date = ?,
                pethnicity = ?,
                pgender = ?,
                pnationality = ?,
                pstate_residence = ?,
                pcity_residence = ?,
                pinclusion_program = ?,
                pfinancial_aid = ?,
                plattes_link = ?,
                pprofessional_role = ?,
                phousehold_members = ?,
                phas_children = ?,
                pis_caregiver = ?,
                peconomic_active_members = ?,
                pfamily_income = ?
            WHERE pcontact_email = ?
            `, [
                pFullName,
                pContactEmail,
                pContactPhone,
                pBirthDate,
                pEthnicity,
                pGender,
                pNationality,
                pStateResidence,
                pCityResidence,
                pInclusionProgram,
                financialAidJson, // Passando a string JSON
                pLattesLink,
                pProfessionalRole,
                pHouseholdMembers,
                hasChildrenInt,
                isCaregiverInt,
                pEconomicActiveMembers,
                pFamilyIncome,
                email
            ]
        );
        
        if (results.affectedRows > 0) {
            res.json({ message: 'Dados atualizados com sucesso!' });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado ou dados não alterados.' });
        }
    } catch (error) {
        console.error('Erro ao atualizar os dados:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
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