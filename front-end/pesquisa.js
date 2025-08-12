document.addEventListener('DOMContentLoaded', () => {
    // Pega os elementos do formulário
    const inputNomePesquisadora = document.getElementById('nomePesquisadoraInput');
    const selectArea = document.getElementById('areaSelect');
    const selectFormacao = document.getElementById('formacaoSelect');
    const selectEstado = document.getElementById('estadoSelect'); // Adicione este ID ao seu HTML
    const btnBuscar = document.getElementById('btnBuscarPesquisadora'); // ID do botão de busca principal
    const resultadosBuscaDiv = document.getElementById('resultadosBusca');

    btnBuscar.addEventListener('click', async () => {
        // Pega os valores de todos os campos de filtro
        const nomeParaBuscar = inputNomePesquisadora.value.trim();
        const areaParaBuscar = selectArea.value;
      
       

        // Verifica se pelo menos um campo foi preenchido
        if (!nomeParaBuscar && !areaParaBuscar  && !estadoParaBuscar) {
            resultadosBuscaDiv.innerHTML = '<p>Por favor, preencha pelo menos um campo para realizar a busca.</p>';
            return;
        }

        resultadosBuscaDiv.innerHTML = '<p>Buscando...</p>';

        try {
           
 const backendUrl = 'http://localhost:3000'; 
            // Constrói os parâmetros da URL dinamicamente
            const params = new URLSearchParams();
            if (nomeParaBuscar) {
                params.append('nome', nomeParaBuscar);
            }
            if (areaParaBuscar) {
                params.append('area', areaParaBuscar);
            }
          
           
            // Envia a requisição com os parâmetros selecionados
            const response = await fetch(`${backendUrl}/api/buscar-pesquisadoras?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }

            const data = await response.json();

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

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            resultadosBuscaDiv.innerHTML = `<p>Ocorreu um erro ao realizar a busca: ${error.message}.</p>`;
        }
    });
});