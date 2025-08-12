

document.addEventListener('DOMContentLoaded', function() {

     
    const emailUsuario = sessionStorage.getItem('loggedInUserEmail');
    const loggedInEmailDisplay = document.getElementById('loggedInEmailDisplay');
    loggedInEmailDisplay.textContent = `E-mail do usuário logado: ${emailUsuario}`;
const form = document.getElementById('cadastroForm');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
 editButton.addEventListener('click', () => {
        // Seleciona todos os campos de entrada, select, textarea e botões dentro do formulário
        const fields = form.querySelectorAll('input, select, textarea, button');
        
        // Remove o atributo 'disabled' de cada campo
        fields.forEach(field => {
            field.removeAttribute('disabled');
        });
        
        // Esconde o botão "Editar" e mostra o "Salvar"
        editButton.style.display = 'none';
        saveButton.style.display = 'block';
    });

 form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        // Coleta todos os dados do formulário
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Adiciona um campo de e-mail ao objeto 'data'
        const loggedInEmail = document.getElementById('loggedInEmailDisplay').textContent;
        data.email = loggedInEmail.replace('Logado como: ', '');

        try {
            const response = await fetch('http://localhost:3000/api/update-profile', {
                method: 'PUT', // PUT é mais apropriado para atualizações
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            const messageDiv = document.getElementById('messageDiv');
            
            if (response.ok) {
                messageDiv.textContent = result.message || 'Dados atualizados com sucesso!';
                messageDiv.style.color = 'green';
                // Opcional: Re-desabilitar campos e trocar botões
                // form.querySelectorAll('input, select, textarea, button').forEach(field => field.disabled = true);
                // editButton.style.display = 'block';
                // saveButton.style.display = 'none';
            } else {
                messageDiv.textContent = result.message || 'Erro ao atualizar os dados.';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Erro:', error);
            const messageDiv = document.getElementById('messageDiv');
            messageDiv.textContent = 'Erro de conexão com o servidor.';
            messageDiv.style.color = 'red';
        }
    });

    
    function showMessage(message, isError = false) {
        const messageDiv = document.getElementById('messageDiv');
        messageDiv.textContent = message;
        messageDiv.className = isError ? 'message error' : 'message success';
    }

    async function fetchData() {
        try {
            // Requisição para a rota do servidor Node.js
            const response = await fetch(`http://localhost:3000/api/dados-usuario?email=${emailUsuario}`);
            const data = await response.json();

            if (!response.ok) {
                // Se a resposta não for 200 OK (ex: 404), trata o erro do servidor
                showMessage(data.error, true);
                return;
            }

             console.log('Dados recebidos da API:', data);
            // Preencher o formulário com os dados recebidos
            document.getElementById('pFullName').value = data.pfull_name || '';
            document.getElementById('pContactEmail').value = data.pcontact_email || '';
            document.getElementById('pContactPhone').value = data.pcontact_phone || '';
            const dataNascimentoISO = data.pbirth_date;

let dataFormatada = '';

if (dataNascimentoISO) {
    const dataObj = new Date(dataNascimentoISO);
    
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Mês é baseado em 0, então somamos 1
    const ano = dataObj.getFullYear();

    dataFormatada = `${ano}-${mes}-${dia}`;
}

document.getElementById('pBirthDate').value = dataFormatada || '';
          

              // Preenche radio buttons para visibilidade de e-mail e telefone
    

// Verifica se o dado existe
if (data.pemail_public !== undefined && data.pemail_public !== null) {
  let pEmailPublicValue;

  // Mapeia o valor numérico para a string correspondente
  if (data.pemail_public === 1) {
    pEmailPublicValue = 'sim';
  } else {
    pEmailPublicValue = 'nao';
  }

  // Seleciona o radio button com o nome e o valor corretos
  const pEmailPublicRadio = document.querySelector(`input[name="pEmailPublic"][value="${pEmailPublicValue}"]`);

  // Se o radio button for encontrado, marca-o como selecionado
  if (pEmailPublicRadio) {
    pEmailPublicRadio.checked = true;
  }
}

// Verifica se o dado do telefone existe
if (data.pphone_public !== undefined && data.pphone_public !== null) {
  let pPhonePublicValue;

  // Mapeia o valor numérico para a string correspondente
  if (data.pphone_public === 1) {
    pPhonePublicValue = 'sim';
  } else {
    pPhonePublicValue = 'nao';
  }

  // Seleciona o radio button com o nome e o valor corretos
  const pPhonePublicRadio = document.querySelector(`input[name="pPhonePublic"][value="${pPhonePublicValue}"]`);

  // Se o radio button for encontrado, marca-o como selecionado
  if (pPhonePublicRadio) {
    pPhonePublicRadio.checked = true;
  }
}



// Verifica se o dado de naturalidade existe e se ele é "brasileira"
if (data.pnationality === 'brasileira') {
  // Se for, seleciona o botão e o marca em uma única linha
  document.getElementById('pNationalityBrazilian').checked = true;
} else if (data.pnationality === 'estrangeira') {
  // Se for "estrangeira", seleciona o botão e o marca
  document.getElementById('pNationalityForeign').checked = true;
}
  
  


document.getElementById('pEthnicity').value = data.pethnicity || '';
 

/* POPULA ESTADOS */

    const selectEstado = document.getElementById("pStateResidence");
            const selectCidade = document.getElementById("pCityResidence");
            const selectEducationState = document.getElementById("pEducationState");
            const selectDocenteWorkState = document.getElementById("pDocenteWorkState");
            const selectPesquisadoraWorkState = document.getElementById("pPesquisadoraWorkState");
            const selectStudentStudyState = document.getElementById("pStudentStudyState");

            // Função para carregar e pré-selecionar as cidades de um estado
            const fetchCities = async (stateId, preselectedCityName) => {
                // Desabilita o campo da cidade para indicar que está carregando
                selectCidade.disabled = true;
                selectCidade.innerHTML = `<option value="">Carregando cidades de ${selectEstado.options[selectEstado.selectedIndex].textContent}...</option>`;

                try {
                    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`);
                    if (!response.ok) {
                        throw new Error('Falha ao buscar cidades da API do IBGE');
                    }
                    const cidades = await response.json();
                    
                    selectCidade.innerHTML = '<option value="">Selecione uma cidade...</option>';
                    
                    cidades.forEach(cidade => {
                        const option = document.createElement("option");
                        option.value = cidade.nome;
                        option.textContent = cidade.nome;

                        if (cidade.nome === preselectedCityName) {
                            option.selected = true;
                        }
                        
                        selectCidade.appendChild(option);
                    });

                    // IMPORTANTE: Removemos a linha que habilitava o campo
                    // para mantê-lo desabilitado após o preenchimento.

                } catch (error) {
                    console.error('Erro ao carregar cidades:', error);
                    selectCidade.innerHTML = '<option value="">Erro ao carregar cidades.</option>';
                    selectCidade.disabled = true;
                }
            };
            
            // Função para buscar e pré-selecionar os estados
            const fetchStates = async () => {
                try {
                    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
                    if (!response.ok) {
                        throw new Error('Falha ao buscar estados da API do IBGE');
                    }
                    const estados = await response.json();

                    // Variaveis para armazenar os IDs pré-selecionados
                    let preselectedStateIdResidence = null;
                    
                    // Limpa e popula o select de Residência
                    selectEstado.innerHTML = '<option value="">Selecione um estado...</option>';
                    
                    // Limpa e popula o select de Educação
                    selectEducationState.innerHTML = '<option value="">Selecione um estado...</option>';

                    // Limpa e popula o select de Docente
                    selectDocenteWorkState.innerHTML = '<option value="">Selecione um estado...</option>';

                    // Limpa e popula o novo select de Pesquisadora
                    selectPesquisadoraWorkState.innerHTML = '<option value="">Selecione um estado...</option>';
                    
                    // Limpa e popula o novo select de Estudo
                    selectStudentStudyState.innerHTML = '<option value="">Selecione um estado...</option>';


                    estados.forEach(estado => {
                        // Popula o select de Residência
                        const optionResidence = document.createElement("option");
                        optionResidence.value = estado.id;
                        optionResidence.textContent = estado.nome;
                        if (String(estado.id) === data.pstate_residence) {
                            optionResidence.selected = true;
                            preselectedStateIdResidence = estado.id;
                        }
                        selectEstado.appendChild(optionResidence);

                        // Popula o select de Educação
                        const optionEducation = document.createElement("option");
                        optionEducation.value = estado.id;
                        optionEducation.textContent = estado.nome;
                        if (String(estado.id) === data.peducation_state) {
                            optionEducation.selected = true;
                        }
                        selectEducationState.appendChild(optionEducation);
                        
                        // Popula o select de Trabalho Docente
                        const optionDocenteWork = document.createElement("option");
                        optionDocenteWork.value = estado.id;
                        optionDocenteWork.textContent = estado.nome;
                        if (String(estado.id) === data.pdocente_work_state) {
                            optionDocenteWork.selected = true;
                        }
                        selectDocenteWorkState.appendChild(optionDocenteWork);
                        
                        // Popula o novo select de Trabalho da Pesquisadora
                        const optionPesquisadoraWork = document.createElement("option");
                        optionPesquisadoraWork.value = estado.id;
                        optionPesquisadoraWork.textContent = estado.nome;
                        if (String(estado.id) === data.ppesquisadora_work_state) {
                            optionPesquisadoraWork.selected = true;
                        }
                        selectPesquisadoraWorkState.appendChild(optionPesquisadoraWork);

                        // Popula o novo select de Estudo do Estudante
                        const optionStudentStudy = document.createElement("option");
                        optionStudentStudy.value = estado.id;
                        optionStudentStudy.textContent = estado.nome;
                        if (String(estado.id) === data.pstudent_study_state) {
                            optionStudentStudy.selected = true;
                        }
                        selectStudentStudyState.appendChild(optionStudentStudy);
                    });
                    
                    // Se um estado de residência foi pré-selecionado, carrega as cidades dele imediatamente.
                    if (preselectedStateIdResidence) {
                        fetchCities(preselectedStateIdResidence, data.pcity_residence);
                    }

                } catch (error) {
                    console.error('Erro ao carregar estados:', error);
                    selectEstado.innerHTML = '<option value="">Erro ao carregar estados.</option>';
                    selectEstado.disabled = true;
                }
            };

            // Inicia o processo de busca quando a página é carregada
            fetchStates();

            // Adiciona um ouvinte de evento 'change' para o estado de residência para carregar as cidades
            selectEstado.addEventListener('change', (event) => {
                const selectedStateId = event.target.value;
                if (selectedStateId) {
                    fetchCities(selectedStateId, null);
                } else {
                    selectCidade.innerHTML = '<option value="">Selecione um estado primeiro...</option>';
                    selectCidade.disabled = true;
                }
            });
            
            // Adiciona um ouvinte de evento 'change' para o campo de educação
            selectEducationState.addEventListener('change', (event) => {
                const selectedStateId = event.target.value;
                if (selectedStateId) {
                    console.log(`Estado de Educação selecionado: ${event.target.options[event.target.selectedIndex].textContent}`);
                }
            });
            
            // Adiciona um ouvinte de evento 'change' para o novo campo de trabalho docente
            selectDocenteWorkState.addEventListener('change', (event) => {
                const selectedStateId = event.target.value;
                if (selectedStateId) {
                    console.log(`Estado de Trabalho do Docente selecionado: ${event.target.options[event.target.selectedIndex].textContent}`);
                }
            });
            
            // Adiciona ouvintes de evento para os novos campos
            selectPesquisadoraWorkState.addEventListener('change', (event) => {
                console.log(`Estado de Trabalho da Pesquisadora selecionado: ${event.target.options[event.target.selectedIndex].textContent}`);
            });

            selectStudentStudyState.addEventListener('change', (event) => {
                console.log(`Estado de Estudo do Estudante selecionado: ${event.target.options[event.target.selectedIndex].textContent}`);
            });




    // Preenche select de gênero e o campo 'Outro' se aplicável
    document.getElementById('pGender').value = data.pgender || '';
    if (data.pgender === 'outro' && data.pgender_other_text) {
        const pGenderOtherText = document.getElementById('pGenderOtherText');
        pGenderOtherText.value = data.pgender_other_text;
        pGenderOtherText.style.display = 'block';
    }




// Acessa os elementos do HTML pelos seus IDs
const pPcdYesRadio = document.getElementById('pPcdYes');
const pPcdNoRadio = document.getElementById('pPcdNo');
const pDeficienciesFields = document.getElementById('pPcdDeficiencyFields');
const pDeficienciesTextarea = document.getElementById('pDeficiencies');

// Preenche o campo de PCD e trata a exibição condicional
// Verifica se o valor é 1 (o que equivale a 'sim')
if (data.pis_pcd === 1) {
    // Seleciona o botão 'Sim'
    pPcdYesRadio.checked = true;
   
    
    // Exibe o campo de deficiências
    if (pDeficienciesFields) {
        pDeficienciesFields.style.display = 'block';
        if (pDeficienciesTextarea) {
            pDeficienciesTextarea.value = data.pdeficiencies || '';
           
        }
    }
// Verifica se o valor é 0 (o que equivale a 'nao')
} else if (data.pis_pcd === 0) {
    // Seleciona o botão 'Não'
    pPcdNoRadio.checked = true;


    // Esconde o campo de deficiências
    if (pDeficienciesFields) {
        pDeficienciesFields.style.display = 'none';
        if (pDeficienciesTextarea) {
            pDeficienciesTextarea.value = '';
        }
    }
}






    // 2. Informações de Escolaridade e Pesquisa
    document.getElementById('pHighestEducation').value = data.phighest_education || '';
 // Verifica se o valor é 1 (sim) ou 0 (nao) e atribui a string correspondente.
const radioValue = data.phas_children === 1 ? 'sim' : 'nao';

// Se a variável radioValue tiver um valor, seleciona o radio button.
if (radioValue) {
    const pHasChildrenRadio = document.querySelector(`input[name="pHasChildren"][value="${radioValue}"]`);
    if (pHasChildrenRadio) {
        pHasChildrenRadio.checked = true;
    }
}

/*if (data.pis_caregiver !== undefined) {
    // Converte o valor de 1 para 'sim' e 0 para 'nao'
    const radioValue = data.pis_caregiver === 1 ? 'sim' : 'nao';

    if (radioValue) {
        // Encontra o radio button com o nome e valor correspondentes
        const pIsCaregiverRadio = document.querySelector(`input[name="pIsCaregiver"][value="${radioValue}"]`);
        
        if (pIsCaregiverRadio) {
            pIsCaregiverRadio.checked = true;
        }
    }
}*/


    document.getElementById('pEducationIES').value = data.peducation_ies || '';
    document.getElementById('pCourseArea').value = data.pcourse_area || '';
    document.getElementById('pCourseName').value = data.pcourse_name || '';

    // Preenche as palavras-chave (keywords)
    const pKeywordsList = document.getElementById('pKeywordsList');
    if (data.pkeywords && Array.isArray(data.pkeywords)) {
        pKeywordsList.innerHTML = '';
        data.pkeywords.forEach(keyword => {
            const span = document.createElement('span');
            span.className = 'keyword-item'; // Assumindo uma classe para estilização
            span.textContent = keyword;
            pKeywordsList.appendChild(span);
        });
    }

    // Preenche select de programa de inclusão
    document.getElementById('pInclusionProgram').value = data.pinclusion_program || '';
    if (data.pinclusion_program === 'outras' && data.pother_inclusion_text) {
        const pOtherInclusionWrapper = document.getElementById('pOtherInclusionWrapper');
        if (pOtherInclusionWrapper) {
            pOtherInclusionWrapper.style.display = 'block';
            document.getElementById('pOtherInclusionText').value = data.pother_inclusion_text;
        }
    }

    // Preenche select múltiplo de auxílio financeiro
    const pFinancialAidSelect = document.getElementById('pFinancialAid');
    if (data.pfinancial_aid && Array.isArray(data.pfinancial_aid)) {
        // Deseleciona todas as opções primeiro
        Array.from(pFinancialAidSelect.options).forEach(option => option.selected = false);
        // Seleciona as opções com base nos dados
        data.pfinancial_aid.forEach(aid => {
            const option = pFinancialAidSelect.querySelector(`option[value="${aid}"]`);
            if (option) {
                option.selected = true;
            }
        });
    }

    // Preenche link do Lattes
    document.getElementById('pLattesLink').value = data.plattes_link || '';

    // Preenche links de publicações
    const pPublicationsList = document.getElementById('pPublicationsList');
    if (data.ppublications && Array.isArray(data.ppublications)) {
        pPublicationsList.innerHTML = '';
        data.ppublications.forEach(publication => {
            const div = document.createElement('div');
            const a = document.createElement('a');
            a.href = publication;
            a.target = '_blank';
            a.textContent = publication;
            div.appendChild(a);
            pPublicationsList.appendChild(div);
        });
    }

    // 3. Atuação Profissional
    document.getElementById('pProfessionalRole').value = data.pprofessional_role || '';
    // Lógica para mostrar/esconder campos condicionais
    const pDocentePesquisadoraFields = document.getElementById('pDocentePesquisadoraFields');
    const pPesquisadoraFields = document.getElementById('pPesquisadoraFields');
    const pStudentFields = document.getElementById('pStudentFields');
    const pNotResearcherFields = document.getElementById('pNotResearcherFields');
    const pNotWorkingFields = document.getElementById('pNotWorkingFields');

    // Oculta todos os campos condicionais primeiro
    [pDocentePesquisadoraFields, pPesquisadoraFields, pStudentFields, pNotResearcherFields, pNotWorkingFields].forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    // Mostra o campo correspondente e preenche os dados
    if (data.pprofessional_role === 'docente_pesquisadora') {
        if (pDocentePesquisadoraFields) {
            pDocentePesquisadoraFields.style.display = 'block';
            document.getElementById('pDocenteWorkState').value = data.pdocente_work_state || '';
            document.getElementById('pDocenteDepartment').value = data.pdocente_department || '';
        }
    } else if (data.pprofessional_role === 'pesquisadora') {
        if (pPesquisadoraFields) {
            pPesquisadoraFields.style.display = 'block';
            document.getElementById('pPesquisadoraWorkState').value = data.ppesquisadora_work_state || '';
            document.getElementById('pPesquisadoraRole').value = data.ppesquisadora_role || '';
        }
    } else if (data.pprofessional_role === 'estudante_pos_graduacao') {
        if (pStudentFields) {
            pStudentFields.style.display = 'block';
            document.getElementById('pStudentStudyState').value = data.pstudent_study_state || '';
            const pPgTypeRadio = document.querySelector(`input[name="pPgType"][value="${data.ppg_type}"]`);
            if (pPgTypeRadio) pPgTypeRadio.checked = true;
            document.getElementById('pPgArea').value = data.ppg_area || '';
            document.getElementById('pPgProgramName').value = data.ppg_program_name || '';
        }
    } else if (data.pprofessional_role === 'atuando_nao_pesquisadora') {
        if (pNotResearcherFields) {
            pNotResearcherFields.style.display = 'block';
            const pNotResearcherRadio = document.querySelector(`input[name="pNotResearcherReason"][value="${data.pnot_researcher_reason}"]`);
            if (pNotResearcherRadio) pNotResearcherRadio.checked = true;
        }
    } else if (data.pprofessional_role === 'nao_atuando') {
        if (pNotWorkingFields) {
            pNotWorkingFields.style.display = 'block';
            const pNotWorkingRadio = document.querySelector(`input[name="pNotWorkingReason"][value="${data.pnot_working_reason}"]`);
            if (pNotWorkingRadio) pNotWorkingRadio.checked = true;
        }
    }

    // 4. Dados Socioeconômicos
    document.getElementById('pHouseholdMembers').value = data.phousehold_members || '';

    if (data.phas_children) {
        const pHasChildrenRadio = document.querySelector(`input[name="pHasChildren"][value="${data.phas_children}"]`);
        if (pHasChildrenRadio) pHasChildrenRadio.checked = true;
    }

    if (data.pis_caregiver !== undefined && data.pis_caregiver !== null) {
                const radioValue = data.pis_caregiver === 1 ? 'sim' : 'nao';
                const pIsCaregiverRadio = document.querySelector(`input[name="pIsCaregiver"][value="${radioValue}"]`);
                if (pIsCaregiverRadio) {
                    pIsCaregiverRadio.checked = true;
                }
            } else {
                // Caso o valor seja nulo, assume-se "prefiro_nao_responder"
                const pIsCaregiverRadio = document.querySelector(`input[name="pIsCaregiver"][value="prefiro_nao_responder"]`);
                if (pIsCaregiverRadio) {
                    pIsCaregiverRadio.checked = true;
                }
            }


        
    document.getElementById('pEconomicActiveMembers').value = data.peconomic_active_members || '';
    document.getElementById('pFamilyIncome').value = data.pfamily_income || '';
// Preenche o campo de participação em STEM
if (data.pparticipate_stem !== undefined) {
    const radioValue = data.pparticipate_stem === 1 ? 'sim' : 'nao';
    const pParticipateStemRadio = document.querySelector(`input[name="pParticipateStem"][value="${radioValue}"]`);
    if (pParticipateStemRadio) {
        pParticipateStemRadio.checked = true;
    }
}

// Preenche o campo de participação em projetos sociais
if (data.pparticipate_social !== undefined) {
    const radioValue = data.pparticipate_social === 1 ? 'sim' : 'nao';
    const pParticipateSocialRadio = document.querySelector(`input[name="pParticipateSocial"][value="${radioValue}"]`);
    if (pParticipateSocialRadio) {
        pParticipateSocialRadio.checked = true;
    }
}

    // Preenche selects múltiplos para desafios e violência de gênero
    const pChallengesSelect = document.getElementById('pChallenges');
    if (data.pchallenges && Array.isArray(data.pchallenges)) {
        Array.from(pChallengesSelect.options).forEach(option => option.selected = false);
        data.pchallenges.forEach(challenge => {
            const option = pChallengesSelect.querySelector(`option[value="${challenge}"]`);
            if (option) {
                option.selected = true;
            }
        });
    }

    const pGenderViolenceSelect = document.getElementById('pGenderViolence');
    if (data.pgender_violence && Array.isArray(data.pgender_violence)) {
        Array.from(pGenderViolenceSelect.options).forEach(option => option.selected = false);
        data.pgender_violence.forEach(violence => {
            const option = pGenderViolenceSelect.querySelector(`option[value="${violence}"]`);
            if (option) {
                option.selected = true;
            }
        });
    }

            showMessage('Dados carregados com sucesso!');

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            showMessage('Erro ao carregar dados. Verifique o servidor.', true);
        }
    }

    fetchData();
});





