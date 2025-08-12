// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Agora o ID do input é 'nomePesquisadoraInput'
    const inputNomePesquisadora = document.getElementById('nomePesquisadoraInput');
    // Agora o ID do botão é 'btnBuscarPesquisadora'
    const btnBuscar = document.getElementById('btnBuscarPesquisadora');
    const selectArea = document.getElementById('areaSelect');
    const selectFormacao = document.getElementById('formacaoSelect');
    const resultadosBuscaDiv = document.getElementById('resultadosBusca');

    btnBuscar.addEventListener('click', async () => {
        const nomeParaBuscar = inputNomePesquisadora.value.trim(); 
        const areaParaBuscar = selectArea.value;
        const formacaoParaBuscar = selectFormacao.value;

        if (nomeParaBuscar === '') {
            resultadosBuscaDiv.innerHTML = '<p>Por favor, digite um nome para buscar.</p>';
            return;
        }

        resultadosBuscaDiv.innerHTML = '<p>Buscando...</p>';

        try {
            const backendUrl = 'http://localhost:3000';  
           // OU a URL real do seu backend

            const response = await fetch(`${backendUrl}/api/buscar-pesquisadoras?nome=${encodeURIComponent(nomeParaBuscar)}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
                throw new Error(`Erro HTTP! Status: ${response.status} - ${errorData.message}`);
            }

            const data = await response.json(); // Assume que o backend retorna JSON

            // --- INÍCIO DA MODIFICAÇÃO PARA TABELA ---
            if (data.length > 0) {
                let htmlResultados = '<table class="tabela-pesquisadoras">'; // Inicia a tabela com uma classe para CSS

                // Cabeçalho da tabela
                htmlResultados += '<thead>';
                htmlResultados += '<tr>';
                htmlResultados += '<th>Nome</th>';
                htmlResultados += '<th>Instituição</th>';
                htmlResultados += '<th>Área de Pesquisa</th>';
                htmlResultados += '<th>Local</th>';
                htmlResultados += '<th>Email</th>';
                htmlResultados += '<th>Currículo Lattes</th>';
                htmlResultados += '</tr>';
                htmlResultados += '</thead>';

                // Corpo da tabela
                htmlResultados += '<tbody>';
                data.forEach(pesquisadora => {
                    htmlResultados += '<tr>'; // Nova linha para cada pesquisadora

                    // Célula Nome
                    htmlResultados += `<td><strong>${pesquisadora.nome}</strong></td>`;

                    // Célula Instituição
                    htmlResultados += `<td>${pesquisadora.instituicao || 'Não informada'}</td>`;

                    // Célula Área de Pesquisa
                    htmlResultados += `<td>${pesquisadora.area|| 'Não informada'}</td>`;
                    // Célula Local
                    htmlResultados += `<td>${pesquisadora.localidade || 'Não informada'}</td>`;


                     htmlResultados += `<td>${pesquisadora.email || 'Não informada'}</td>`;
                    // Célula Currículo Lattes
                    
        const lattesLink = pesquisadora.link_lattes
            ? `<a href="${pesquisadora.link_lattes}" target="_blank" rel="noopener noreferrer">${pesquisadora.link_lattes}</a>`
            : 'Não disponível';

                    htmlResultados += `<td>${lattesLink}</td>`;

                    htmlResultados += '</tr>'; // Fecha a linha
                });
                htmlResultados += '</tbody>';
                htmlResultados += '</table>'; // Fecha a tabela

                resultadosBuscaDiv.innerHTML = htmlResultados;
            } else {
                resultadosBuscaDiv.innerHTML = '<p>Nenhuma pesquisadora encontrada com este nome.</p>';
            }
            // --- FIM DA MODIFICAÇÃO PARA TABELA ---

        } catch (error) {
            console.error('Erro ao buscar pesquisadoras:', error);
            resultadosBuscaDiv.innerHTML = `<p>Ocorreu um erro ao realizar a busca: ${error.message}. Verifique se o backend está rodando e acessível.</p>`;
        }
    });

    // Você pode adicionar mais lógica aqui para os outros filtros (estado, universidade, etc.)
    // quando o backend estiver pronto para recebê-los.
});