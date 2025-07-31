document.addEventListener('DOMContentLoaded', async () => {
    const cadastroForm = document.getElementById('cadastroForm');
    const messageDiv = document.getElementById('messageDiv');
    const loggedInEmailDisplay = document.getElementById('loggedInEmailDisplay');
    const emailToSearch = sessionStorage.getItem('loggedInUserEmail');

    if (emailToSearch) {
        loggedInEmailDisplay.textContent = `Você está visualizando os dados de: ${emailToSearch}`;
    }
    // Adicione aqui o código de frontend para buscar dados da pesquisadora via API, se necessário.
  
});