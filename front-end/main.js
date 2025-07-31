// frontend/main.js

// --- Configuração da URL Base da API do Backend ---
const API_BASE_URL = 'http://localhost:3000'; 
console.log('Frontend: API_BASE_URL configurada para:', API_BASE_URL);

// --- Elementos do DOM (HTML) ---
// Agora pegamos o formulário de login pelo ID
const loginForm = document.getElementById('loginForm');
// Os inputs de email e senha, conforme os IDs no HTML
const emailInput = document.getElementById('email'); 
const passwordInput = document.getElementById('password'); 
// Onde as mensagens serão exibidas
const messageDiv = document.getElementById('messageDiv'); 

// --- Função para exibir mensagens na UI ---
function showMessage(message, type = 'info') {
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`; 
        messageDiv.style.display = 'block'; 
        setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.textContent = ''; // Limpa o texto da mensagem
        }, 5000); // Mensagem some após 5 segundos
    } else {
        console.warn('Elemento messageDiv não encontrado no HTML.');
        alert(message); 
    }
}

// --- Função Genérica para Enviar Requisições de Autenticação ao Backend ---
async function sendAuthRequest(endpoint, data) {
    try {
        const url = `${API_BASE_URL}/${endpoint}`;
        console.log('Frontend: Enviando requisição para:', url);
        console.log('Frontend: Dados da requisição:', data);

        const response = await fetch(url, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data) 
        });

        const result = await response.json(); 

        if (response.ok) { 
            showMessage(result.message, 'success');
            console.log('Frontend: Resposta do servidor (sucesso):', result);
            
            if (endpoint === 'auth/login') { 
                if (result.token) {
                    localStorage.setItem('jwt_token', result.token);
                    console.log('Frontend: Token JWT salvo:', result.token);
                }
                
                // 1. Obtenha o elemento HTML do input de e-mail pelo seu ID
const emailInput = document.getElementById('email'); 

// 2. PEGUE O VALOR DO INPUT! Isso é crucial.
const emailValor = emailInput.value; 

// 3. Salve o VALOR (a string do e-mail) no sessionStorage
sessionStorage.setItem('loggedInUserEmail', emailValor);

                setTimeout(() => {
                    window.location.href = '/front-end/dados.html'; // Redireciona para sua página protegida
                }, 1500); // Redireciona após 1.5 segundos
            } 
            // Se houver uma rota de registro em outra página, você precisaria de outro form/logic
            // Se o registro for no mesmo HTML, o formulário de registro também precisaria de um listener
        } else { 
            showMessage(result.message || 'Ocorreu um erro desconhecido no servidor.', 'error');
            console.error('Frontend: Resposta do servidor (erro):', result);
        }
    } catch (error) {
        console.error('Frontend: Erro ao conectar com o backend ou processar resposta:', error);
        if (error instanceof SyntaxError) {
             showMessage('Erro: A resposta do servidor não é JSON. Verifique o backend.', 'error');
        } else {
             showMessage('Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.', 'error');
        }
    }
}

// --- Event Listener para o Formulário de Login ---
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // MUITO IMPORTANTE: Previne o recarregamento padrão da página!

        // Pega os valores dos inputs usando os IDs correspondentes
        const email = emailInput.value; 
        const password = passwordInput.value; 

        // Chame a função sendAuthRequest com o endpoint e os dados
        sendAuthRequest('auth/login', { email, password });
    });
} else {
    console.error('Frontend: Elemento loginForm não encontrado no HTML. O script pode não funcionar.');
}

// Removi o listener de registerForm pois este HTML parece ser apenas para login.
// Se você tiver um formulário de registro separado, precisará de outro main.js
// ou adaptar este para lidar com ambos os formulários (idealmente em páginas separadas).