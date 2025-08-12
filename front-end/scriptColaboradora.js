 document.addEventListener('DOMContentLoaded', function() {
            const pConsentCheckbox = document.getElementById('pConsentCheckbox');
            const pCadastroForm = document.getElementById('pCadastroForm');
            const pFormContent = document.getElementById('pFormContent');
            const pSubmitButton = document.getElementById('pSubmitButton');
            const pMessageDiv = document.getElementById('pMessageDiv');

            const pStateResidenceSelect = document.getElementById('pStateResidence');
            const pCityResidenceSelect = document.getElementById('pCityResidence');

            const pGenderSelect = document.getElementById('pGender');
            const pGenderOtherText = document.getElementById('pGenderOtherText');

            const pInclusionProgramSelect = document.getElementById('pInclusionProgram');
            const pOtherInclusionText = document.getElementById('pOtherInclusionText');
            const pOtherInclusionWrapper = document.getElementById('pOtherInclusionWrapper');

            const pProfessionalRoleSelect = document.getElementById('pProfessionalRole');
            const pDocentePesquisadoraFields = document.getElementById('pDocentePesquisadoraFields');
            const pPesquisadoraFields = document.getElementById('pPesquisadoraFields');
            const pStudentFields = document.getElementById('pStudentFields');
            const pNotResearcherFields = document.getElementById('pNotResearcherFields');
            const pNotWorkingFields = document.getElementById('pNotWorkingFields');

            const pNotWorkingReasonRadios = document.querySelectorAll('input[name="pNotWorkingReason"]');
            const pNotWorkingOtherReasonText = document.getElementById('pNotWorkingOtherReasonText');

            const pPcdYes = document.getElementById('pPcdYes');
            const pPcdNo = document.getElementById('pPcdNo');
            const pDeficiencies = document.getElementById('pDeficiencies');
            const pPcdDeficiencyFields = document.getElementById('pPcdDeficiencyFields');


            const pEducationStateSelect = document.getElementById('pEducationState');
            const pDocenteWorkStateSelect = document.getElementById('pDocenteWorkState');
            const pPesquisadoraWorkStateSelect = document.getElementById('pPesquisadoraWorkState');
            const pStudentStudyStateSelect = document.getElementById('pStudentStudyState');

            // Elementos para palavras-chave
            const pKeywordInput = document.getElementById('pKeywordInput');
            const pAddKeywordBtn = document.getElementById('pAddKeywordBtn');
            const pKeywordsList = document.getElementById('pKeywordsList');
            let pKeywordCount = 0;
            const P_MAX_KEYWORDS = 3;

            // Elementos para publicações
            const pPublicationInput = document.getElementById('pPublicationInput');
            const pAddPublicationBtn = document.getElementById('pAddPublicationBtn');
            const pPublicationsList = document.getElementById('pPublicationsList');
            let pPublicationCount = 0;
            const P_MAX_PUBLICATIONS = 3;

            // Elementos para desafios (multi-seleção)
            const pChallengesSelect = document.getElementById('pChallenges');
            const P_MAX_CHALLENGES = 3;

            // Elementos para violência de gênero (multi-seleção)
            const pGenderViolenceSelect = document.getElementById('pGenderViolence');
            const P_MAX_GENDER_VIOLENCE = 3;


            // Função para exibir mensagens na div de mensagens
            function showMessage(msg, type) {
                if (pMessageDiv) {
                    pMessageDiv.textContent = msg;
                    pMessageDiv.className = `message ${type}`; // Adiciona classe para estilização (success/error)
                    pMessageDiv.style.display = 'block';
                }
            }

            // Função para limpar mensagens
            function clearMessage() {
                if (pMessageDiv) {
                    pMessageDiv.textContent = '';
                    pMessageDiv.className = 'message';
                    pMessageDiv.style.display = 'none';
                }
            }



            // Seleciona os elementos principais
            const workingRadios = document.querySelectorAll('input[name="pIsCurrentlyWorking"]');
            const profissaoAtualField = document.getElementById('profissaoAtualField');
            const notWorkingReasonField = document.getElementById('notWorkingReasonField');
            
            
                // Adiciona um listener de evento 'change' a todos os botões de rádio
                workingRadios.forEach(radio => {
                    radio.addEventListener('change', (event) => {
                        // Verifica qual botão foi selecionado
                        if (event.target.value === 'sim') {
                            // Se for 'Sim', exibe o campo de profissão e esconde o outro
                            profissaoAtualField.classList.remove('hidden');
                            notWorkingReasonField.classList.add('hidden');
                        } else {
                            // Se for 'Não', esconde o campo de profissão e exibe o outro
                            profissaoAtualField.classList.add('hidden');
                            notWorkingReasonField.classList.remove('hidden');
                        }
                    });
                });

            // Função para habilitar ou desabilitar os campos
            function toggleFormFields(enable) {
                const formElements = pFormContent.querySelectorAll('input, select, textarea, button');
                
                formElements.forEach(element => {
                    // Exclui os campos de texto "Outro" e os de adição de item da iteração geral,
                    // pois o estado deles é controlado por suas respectivas funções toggle ou lógica específica.
                    if (element.id !== 'pConsentCheckbox' && 
                        element.id !== 'pGenderOtherText' && 
                        element.id !== 'pOtherInclusionText' &&
                        element.id !== 'pNotWorkingOtherReasonText' &&
                        element.id !== 'pKeywordInput' && 
                        element.id !== 'pAddKeywordBtn' &&
                        element.id !== 'pPublicationInput' && 
                        element.id !== 'pAddPublicationBtn' 
                        ) { 
                        element.disabled = !enable;
                    }
                });
                if (pSubmitButton) {
                    pSubmitButton.disabled = !enable;
                }

                // Lógica específica para os campos de adicionar item
                if (pKeywordInput) pKeywordInput.disabled = !enable;
                if (pAddKeywordBtn) pAddKeywordBtn.disabled = !enable || (pKeywordCount >= P_MAX_KEYWORDS);

                if (pPublicationInput) pPublicationInput.disabled = !enable;
                if (pAddPublicationBtn) pAddPublicationBtn.disabled = !enable || (pPublicationCount >= P_MAX_PUBLICATIONS);

                // Lógica para campos de seleção múltipla com limite
                if (pChallengesSelect) pChallengesSelect.disabled = !enable;
                if (pGenderViolenceSelect) pGenderViolenceSelect.disabled = !enable;


                if (enable) {
                    toggleGenderOtherField();
                    toggleInclusionProgramOtherField();
                    togglePcdDeficiencyFields();
                    toggleProfessionalRoleFields();
                    toggleNotWorkingReasonField();
                    
                    loadStates(pStateResidenceSelect, 'Selecione o Estado'); 
                    loadStates(pEducationStateSelect, 'Selecione o Estado'); 
                    loadStates(pDocenteWorkStateSelect, 'Selecione o Estado');
                    loadStates(pPesquisadoraWorkStateSelect, 'Selecione o Estado');
                    loadStates(pStudentStudyStateSelect, 'Selecione o Estado');
                } else {
                    // Reset e desabilita campos condicionais
                    if (pGenderOtherText) {
                        pGenderOtherText.style.display = 'none';
                        pGenderOtherText.disabled = true;
                        pGenderOtherText.removeAttribute('required');
                        pGenderOtherText.value = '';
                    }
                    if (pOtherInclusionWrapper) pOtherInclusionWrapper.style.display = 'none';
                    if (pOtherInclusionText) {
                        pOtherInclusionText.disabled = true;
                        pOtherInclusionText.removeAttribute('required');
                        pOtherInclusionText.value = '';
                    }
                    if (pPcdDeficiencyFields) pPcdDeficiencyFields.style.display = 'none';
                    if (pDeficiencies) {
                        pDeficiencies.disabled = true;
                        pDeficiencies.removeAttribute('required');
                        pDeficiencies.value = '';
                    }
                    if (pDocentePesquisadoraFields) pDocentePesquisadoraFields.style.display = 'none';
                    if (pPesquisadoraFields) pPesquisadoraFields.style.display = 'none';
                    if (pStudentFields) pStudentFields.style.display = 'none';
                    if (pNotResearcherFields) pNotResearcherFields.style.display = 'none';
                    if (pNotWorkingFields) pNotWorkingFields.style.display = 'none';
                    if (pNotWorkingOtherReasonText) {
                        pNotWorkingOtherReasonText.style.display = 'none';
                        pNotWorkingOtherReasonText.disabled = true;
                        pNotWorkingOtherReasonText.removeAttribute('required');
                        pNotWorkingOtherReasonText.value = '';
                    }

                    // Limpa e desabilita os selects de estado e cidade de residência
                    if (pStateResidenceSelect) {
                        pStateResidenceSelect.innerHTML = '<option value="">Selecione o Estado</option>';
                        pStateResidenceSelect.disabled = true;
                    }
                    if (pCityResidenceSelect) {
                        pCityResidenceSelect.innerHTML = '<option value="">Selecione um estado primeiro...</option>';
                        pCityResidenceSelect.disabled = true;
                    }

                    // Limpa e desabilita o select de estado de formação
                    if (pEducationStateSelect) {
                        pEducationStateSelect.innerHTML = '<option value="">Carregando estados...</option><option value="exterior">Exterior</option>';
                        pEducationStateSelect.disabled = true;
                    }

                    // Limpa e desabilita os selects de estado de trabalho/estudo
                    if (pDocenteWorkStateSelect) {
                        pDocenteWorkStateSelect.innerHTML = '<option value="">Carregando estados...</option>';
                        pDocenteWorkStateSelect.disabled = true;
                    }
                    if (pPesquisadoraWorkStateSelect) {
                        pPesquisadoraWorkStateSelect.innerHTML = '<option value="">Carregando estados...</option>';
                        pPesquisadoraWorkStateSelect.disabled = true;
                    }
                    if (pStudentStudyStateSelect) {
                        pStudentStudyStateSelect.innerHTML = '<option value="">Carregando estados...</option>';
                        pStudentStudyStateSelect.disabled = true;
                    }
                    // Limpa e desabilita as listas de palavras-chave e publicações
                    if (pKeywordsList) pKeywordsList.innerHTML = '';
                    pKeywordCount = 0;
                    if (pAddKeywordBtn) pAddKeywordBtn.disabled = true;
                    if (pKeywordInput) pKeywordInput.disabled = true;
                    if (pKeywordInput) pKeywordInput.value = '';

                    if (pPublicationsList) pPublicationsList.innerHTML = '';
                    pPublicationCount = 0;
                    if (pAddPublicationBtn) pAddPublicationBtn.disabled = true;
                    if (pPublicationInput) pPublicationInput.disabled = true;
                    if (pPublicationInput) pPublicationInput.value = '';
                }
            }

            // Função para mostrar/esconder o campo de gênero "Outro"
            function toggleGenderOtherField() {
                if (pGenderSelect && pGenderOtherText) { 
                    if (pGenderSelect.value === 'outro') {
                        pGenderOtherText.style.display = 'block';
                        pGenderOtherText.disabled = !pConsentCheckbox.checked;
                        pGenderOtherText.setAttribute('required', 'required');
                    } else {
                        pGenderOtherText.style.display = 'none';
                        pGenderOtherText.disabled = true;
                        pGenderOtherText.removeAttribute('required');
                        pGenderOtherText.value = '';
                    }
                }
            }

            // Função para mostrar/esconder o campo "Outras razões" (Inclusão)
            function toggleInclusionProgramOtherField() {
                if (pInclusionProgramSelect && pOtherInclusionWrapper && pOtherInclusionText) {
                    if (pInclusionProgramSelect.value === 'outras') {
                        pOtherInclusionWrapper.style.display = 'block';
                        pOtherInclusionText.disabled = !pConsentCheckbox.checked;
                        pOtherInclusionText.setAttribute('required', 'required');
                    } else {
                        pOtherInclusionWrapper.style.display = 'none';
                        pOtherInclusionText.disabled = true;
                        pOtherInclusionText.removeAttribute('required');
                        pOtherInclusionText.value = '';
                    }
                }
            }

            // Função para mostrar/esconder o campo de deficiências (PCD)
            function togglePcdDeficiencyFields() {
                if (pPcdYes && pPcdDeficiencyFields && pDeficiencies) {
                    if (pPcdYes.checked) {
                        pPcdDeficiencyFields.style.display = 'block';
                        pDeficiencies.disabled = !pConsentCheckbox.checked;
                        pDeficiencies.setAttribute('required', 'required');
                    } else {
                        pPcdDeficiencyFields.style.display = 'none';
                        pDeficiencies.disabled = true;
                        pDeficiencies.removeAttribute('required');
                        pDeficiencies.value = '';
                    }
                }
            }

            // Função para mostrar/esconder campos de atuação profissional
            function toggleProfessionalRoleFields() {
                const role = pProfessionalRoleSelect ? pProfessionalRoleSelect.value : '';

                // Esconde todos os campos condicionais primeiro
                if (pDocentePesquisadoraFields) pDocentePesquisadoraFields.style.display = 'none';
                if (pPesquisadoraFields) pPesquisadoraFields.style.display = 'none';
                if (pStudentFields) pStudentFields.style.display = 'none';
                if (pNotResearcherFields) pNotResearcherFields.style.display = 'none';
                if (pNotWorkingFields) pNotWorkingFields.style.display = 'none';

                // Desabilita todos os inputs dentro dos campos condicionais
                pDocentePesquisadoraFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
                pPesquisadoraFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
                pStudentFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
                pNotResearcherFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
                pNotWorkingFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);


                // Mostra e habilita os campos relevantes
                if (pConsentCheckbox.checked) {
                    if (role === 'docente_pesquisadora') {
                        if (pDocentePesquisadoraFields) pDocentePesquisadoraFields.style.display = 'block';
                        pDocentePesquisadoraFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
                    } else if (role === 'pesquisadora') {
                        if (pPesquisadoraFields) pPesquisadoraFields.style.display = 'block';
                        pPesquisadoraFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
                    } else if (role === 'estudante_pos_graduacao') {
                        if (pStudentFields) pStudentFields.style.display = 'block';
                        pStudentFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
                    } else if (role === 'atuando_nao_pesquisadora') {
                        if (pNotResearcherFields) pNotResearcherFields.style.display = 'block';
                        pNotResearcherFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
                    } else if (role === 'nao_atuando') {
                        if (pNotWorkingFields) pNotWorkingFields.style.display = 'block';
                        pNotWorkingFields?.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
                    }
                }
            }

            // Função para mostrar/esconder o campo "Outras razões" para "Não atuando profissionalmente"
            function toggleNotWorkingReasonField() {
                let selectedValue = '';
                pNotWorkingReasonRadios.forEach(radio => {
                    if (radio.checked) {
                        selectedValue = radio.value;
                    }
                });

                if (pNotWorkingOtherReasonText) {
                    if (selectedValue === 'other_reasons') {
                        pNotWorkingOtherReasonText.style.display = 'block';
                        pNotWorkingOtherReasonText.disabled = !pConsentCheckbox.checked;
                        pNotWorkingOtherReasonText.setAttribute('required', 'required');
                    } else {
                        pNotWorkingOtherReasonText.style.display = 'none';
                        pNotWorkingOtherReasonText.disabled = true;
                        pNotWorkingOtherReasonText.removeAttribute('required');
                        pNotWorkingOtherReasonText.value = '';
                    }
                }
            }

            // Função para carregar estados (genérica, pode ser usada para múltiplos selects de estado)
            async function loadStates(selectElement, defaultOptionText = 'Selecione o Estado') {
                if (!selectElement) return;

                selectElement.innerHTML = `<option value="">Carregando estados...</option>`;
                
                try {
                    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
                    if (!response.ok) {
                        throw new Error('Erro ao carregar estados do IBGE.');
                    }
                    const states = await response.json();
                    
                    selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
                    states.forEach(state => {
                        const option = document.createElement('option');
                        option.value = state.id;
                        option.textContent = state.nome;
                        selectElement.appendChild(option);
                    });
                    if (selectElement.id === 'pEducationState') {
                        const exteriorOption = document.createElement('option');
                        exteriorOption.value = "exterior";
                        exteriorOption.textContent = "Exterior";
                        selectElement.appendChild(exteriorOption);
                    }
                    selectElement.disabled = pConsentCheckbox ? !pConsentCheckbox.checked : true;
                } catch (error) {
                    console.error(`Erro ao carregar estados para ${selectElement.id}:`, error);
                    selectElement.innerHTML = '<option value="">Erro ao carregar estados</option>';
                }
            }

            // Função para carregar cidades
            async function loadCities(stateId) {
                if (!pCityResidenceSelect) return;

                pCityResidenceSelect.innerHTML = '<option value="">Carregando cidades...</option>';
                pCityResidenceSelect.disabled = true;

                if (!stateId) {
                    pCityResidenceSelect.innerHTML = '<option value="">Selecione um estado primeiro...</option>';
                    return;
                }

                try {
                    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`);
                    if (!response.ok) {
                        throw new Error('Erro ao carregar cidades do IBGE.');
                    }
                    const cities = await response.json();

                    pCityResidenceSelect.innerHTML = '<option value="">Selecione a Cidade</option>';
                    cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city.nome;
                        option.textContent = city.nome;
                        pCityResidenceSelect.appendChild(option);
                    });
                    pCityResidenceSelect.disabled = pConsentCheckbox ? !pConsentCheckbox.checked : true;
                } catch (error) {
                    console.error('Erro ao carregar cidades:', error);
                    pCityResidenceSelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
                }
            }

            // Lógica para adicionar e remover palavras-chave
            if (pAddKeywordBtn && pKeywordInput && pKeywordsList) {
                pAddKeywordBtn.addEventListener('click', function() {
                    const keywordText = pKeywordInput.value.trim();
                    clearMessage(); // Limpa mensagens anteriores

                    if (keywordText && pKeywordCount < P_MAX_KEYWORDS) {
                        const keywordItem = document.createElement('div');
                        keywordItem.classList.add('added-item');
                        
                        const hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.name = 'pKeywords[]'; // Nome do campo para o backend
                        hiddenInput.value = keywordText;

                        const keywordSpan = document.createElement('span');
                        keywordSpan.textContent = keywordText;

                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.textContent = 'x';
                        removeBtn.addEventListener('click', function() {
                            pKeywordsList.removeChild(keywordItem);
                            pKeywordCount--;
                            pAddKeywordBtn.disabled = !pConsentCheckbox.checked || (pKeywordCount >= P_MAX_KEYWORDS);
                        });

                        keywordItem.appendChild(keywordSpan);
                        keywordItem.appendChild(removeBtn);
                        keywordItem.appendChild(hiddenInput);
                        pKeywordsList.appendChild(keywordItem);

                        pKeywordInput.value = '';
                        pKeywordCount++;
                        pAddKeywordBtn.disabled = !pConsentCheckbox.checked || (pKeywordCount >= P_MAX_KEYWORDS);
                    } else if (pKeywordCount >= P_MAX_KEYWORDS) {
                        showMessage('Limite de 3 palavras-chave atingido.', 'error');
                    } else if (!keywordText) {
                        showMessage('O campo de palavra-chave não pode estar vazio.', 'error');
                    }
                });

                pAddKeywordBtn.disabled = !pConsentCheckbox.checked || (pKeywordCount >= P_MAX_KEYWORDS);
            }

            // Lógica para adicionar e remover publicações
            if (pAddPublicationBtn && pPublicationInput && pPublicationsList) {
                pAddPublicationBtn.addEventListener('click', function() {
                    const publicationUrl = pPublicationInput.value.trim();
                    clearMessage(); // Limpa mensagens anteriores

                    // Validação de URL mais flexível
                    const urlPattern = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;

                    if (publicationUrl && urlPattern.test(publicationUrl) && pPublicationCount < P_MAX_PUBLICATIONS) {
                        const publicationItem = document.createElement('div');
                        publicationItem.classList.add('added-item');
                        
                        const hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.name = 'pPublications[]'; // Nome do campo para o backend
                        hiddenInput.value = publicationUrl;

                        const publicationLink = document.createElement('a');
                        publicationLink.href = publicationUrl.startsWith('http://') || publicationUrl.startsWith('https://') ? publicationUrl : `https://${publicationUrl}`;
                        publicationLink.textContent = publicationUrl.length > 40 ? publicationUrl.substring(0, 37) + '...' : publicationUrl;
                        publicationLink.target = '_blank';
                        publicationLink.rel = 'noopener noreferrer';

                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.textContent = 'x';
                        removeBtn.addEventListener('click', function() {
                            pPublicationsList.removeChild(publicationItem);
                            pPublicationCount--;
                            pAddPublicationBtn.disabled = !pConsentCheckbox.checked || (pPublicationCount >= P_MAX_PUBLICATIONS);
                        });

                        publicationItem.appendChild(publicationLink);
                        publicationItem.appendChild(removeBtn);
                        publicationItem.appendChild(hiddenInput);
                        pPublicationsList.appendChild(publicationItem);

                        pPublicationInput.value = '';
                        pPublicationCount++;
                        pAddPublicationBtn.disabled = !pConsentCheckbox.checked || (pPublicationCount >= P_MAX_PUBLICATIONS);
                    } else if (pPublicationCount >= P_MAX_PUBLICATIONS) {
                        showMessage('Limite de 3 publicações atingido. Não é possível adicionar mais.', 'error');
                    } else if (!publicationUrl) {
                        showMessage('O campo de link da publicação não pode estar vazio.', 'error');
                    } else {
                        showMessage('Por favor, insira um URL válido para a publicação (ex: https://exemplo.com ou www.exemplo.com).', 'error');
                    }
                });

                pAddPublicationBtn.disabled = !pConsentCheckbox.checked || (pPublicationCount >= P_MAX_PUBLICATIONS);
            }

            // Lógica para seleção múltipla com limite (Desafios)
            if (pChallengesSelect) {
                pChallengesSelect.addEventListener('change', function() {
                    const selectedOptions = Array.from(this.options).filter(option => option.selected);
                    if (selectedOptions.length > P_MAX_CHALLENGES) {
                        showMessage(`Você pode selecionar no máximo ${P_MAX_CHALLENGES} desafios.`, 'error');
                        // Desseleciona o último item adicionado se o limite for excedido
                        selectedOptions[selectedOptions.length - 1].selected = false;
                    } else {
                        clearMessage();
                    }
                });
            }

            // Lógica para seleção múltipla com limite (Violência de Gênero)
            if (pGenderViolenceSelect) {
                pGenderViolenceSelect.addEventListener('change', function() {
                    const selectedOptions = Array.from(this.options).filter(option => option.selected);
                    if (selectedOptions.length > P_MAX_GENDER_VIOLENCE) {
                        showMessage(`Você pode selecionar no máximo ${P_MAX_GENDER_VIOLENCE} tipos de violência de gênero.`, 'error');
                        // Desseleciona o último item adicionado se o limite for excedido
                        selectedOptions[selectedOptions.length - 1].selected = false;
                    } else {
                        clearMessage();
                    }
                });
            }


            // Event listeners para o checkbox de consentimento
            if (pConsentCheckbox) {
                pConsentCheckbox.addEventListener('change', function() {
                    toggleFormFields(this.checked);
                });
            }

            // Event listener para a seleção de estado de residência
            if (pStateResidenceSelect) {
                pStateResidenceSelect.addEventListener('change', function() {
                    loadCities(this.value);
                });
            }

            // Event listener para o select de gênero
            if (pGenderSelect) {
                pGenderSelect.addEventListener('change', toggleGenderOtherField);
            }

            // Event listener para o select de programa de inclusão
            if (pInclusionProgramSelect) {
                pInclusionProgramSelect.addEventListener('change', toggleInclusionProgramOtherField);
            }

            // Event listeners para os radios de PCD
            if (pPcdYes) pPcdYes.addEventListener('change', togglePcdDeficiencyFields);
            if (pPcdNo) pPcdNo.addEventListener('change', togglePcdDeficiencyFields);

            // Event listener para o select de atuação profissional
            if (pProfessionalRoleSelect) {
                pProfessionalRoleSelect.addEventListener('change', toggleProfessionalRoleFields);
            }

            // Event listeners para os radios de motivo de não atuação profissional
            pNotWorkingReasonRadios.forEach(radio => {
                radio.addEventListener('change', toggleNotWorkingReasonField);
            });

            // Listener para o submit do formulário (AJAX)
            if (pCadastroForm) {
                pCadastroForm.addEventListener('submit', async function(event) {
                    event.preventDefault(); // Impede o envio padrão do formulário
                    clearMessage(); // Limpa mensagens anteriores

                    // Coleta todos os dados do formulário
                    const formData = new FormData(pCadastroForm);
                    const data = {};
                    for (let [key, value] of formData.entries()) {
                        // Lida com campos de arrays (como keywords[] e publications[])
                        if (key.endsWith('[]')) {
                            const newKey = key.slice(0, -2); // Remove '[]'
                            if (!data[newKey]) {
                                data[newKey] = [];
                            }
                            data[newKey].push(value);
                        } else {
                            data[key] = value;
                        }
                    }

                    // Lidar com seleções múltiplas de selects (financialAid, challenges, genderViolence)
                    // FormData.getAll() é uma opção melhor para múltiplos valores do mesmo name
                    data['pFinancialAid'] = formData.getAll('pFinancialAid');
                    data['pChallenges'] = formData.getAll('pChallenges');
                    data['pGenderViolence'] = formData.getAll('pGenderViolence');


                   // Converte booleanos de string 'true'/'false' ou 'sim'/'nao'
// Padroniza a string para minúsculas antes de comparar
data.pEmailPublic = (data.pEmailPublic && data.pEmailPublic.toLowerCase() === 'sim');
data.pPhonePublic = (data.pPhonePublic && data.pPhonePublic.toLowerCase() === 'sim');
data.pPcd = (data.pPcd && data.pPcd.toLowerCase() === 'sim');
data.pHasChildren = (data.pHasChildren && data.pHasChildren.toLowerCase() === 'sim');
data.pIsCaregiver = (data.pIsCaregiver && data.pIsCaregiver.toLowerCase() === 'sim');
data.pParticipateStem = (data.pParticipateStem && data.pParticipateStem.toLowerCase() === 'sim');
data.pParticipateSocial = (data.pParticipateSocial && data.pParticipateSocial.toLowerCase() === 'sim');

// Para esses campos, a comparação é com a string 'true'
data.pReceiveContact = (data.pReceiveContact && data.pReceiveContact.toLowerCase() === 'true');
data.pNoInfoRbmc = (data.pNoInfoRbmc && data.pNoInfoRbmc.toLowerCase() === 'true');

                    // NOVO: Log dos dados que serão enviados
                    console.log('Dados sendo enviados:', data);

                    pSubmitButton.disabled = true; // Desabilita o botão para evitar múltiplos envios
                    pSubmitButton.textContent = 'Enviando...';

                    try {
                        const response = await fetch(pCadastroForm.action, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        });

                        const result = await response.json(); // Assumindo que o backend sempre retorna JSON

                        if (response.ok) {
                            showMessage(result.message || 'Cadastro realizado com sucesso!', 'success');
                            pCadastroForm.reset(); // Limpa o formulário
                            toggleFormFields(false); // Reseta o estado dos campos
                            pConsentCheckbox.checked = false; // Desmarca o consentimento
                        } else {
                            // Se o servidor retornou um erro 400 com campos faltando
                            if (response.status === 400 && result.missing && result.missing.length > 0) {
                                showMessage(`Erro ao cadastrar: Campos obrigatórios faltando: ${result.missing.join(', ')}.`, 'error');
                            } else {
                                showMessage(result.message || 'Erro ao cadastrar. Tente novamente.', 'error');
                            }
                            console.error('Erro do servidor:', result);
                        }
                    } catch (error) {
                        console.error('Erro na requisição (rede ou parsing):', error);
                        showMessage('Erro de conexão. Verifique o console para mais detalhes.', 'error');
                    } finally {
                        pSubmitButton.disabled = false;
                        pSubmitButton.textContent = 'Cadastrar';
                    }
                });
            }


            // Inicialmente, desabilita todos os campos e o botão
            toggleFormFields(false);
            // Garante que o estado inicial dos campos condicionais seja definido
            toggleGenderOtherField();
            toggleInclusionProgramOtherField();
            togglePcdDeficiencyFields();
            toggleProfessionalRoleFields();
            toggleNotWorkingReasonField();
        })
        .catch(error => {
            console.error('Erro ao carregar o script:', error);
            showMessage('Erro ao carregar o formulário. Verifique o console para mais detalhes.', 'error');
        });
    
    
