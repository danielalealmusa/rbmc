// public/script2.js

// Script para mostrar/esconder o campo de deficiências
const pcdYes = document.getElementById('pcdYes');
const pcdNo = document.getElementById('pcdNo');
const pcdDeficiencyFields = document.getElementById('pcdDeficiencyFields');

pcdYes.addEventListener('change', () => {
    if (pcdYes.checked) {
        pcdDeficiencyFields.style.display = 'block';
    }
});
pcdNo.addEventListener('change', () => {
    if (pcdNo.checked) {
        pcdDeficiencyFields.style.display = 'none';
    }
});

// Script para mostrar/esconder o campo de "Outro" no gênero
const genderOther = document.getElementById('genderOther');
const genderOtherText = document.getElementById('genderOtherText');

genderOther.addEventListener('change', () => {
    if (genderOther.checked) {
        genderOtherText.style.display = 'inline-block';
    }
});

document.querySelectorAll('input[name="gender"]').forEach(radio => {
    if (radio.id !== 'genderOther') {
        radio.addEventListener('change', () => {
            genderOtherText.style.display = 'none';
        });
    }
});

// Script para preenchimento de estados e cidades
const ufSelect = document.getElementById('uf');
const cidadeSelect = document.getElementById('cidade');

function preencherEstados() {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(response => response.json())
        .then(estados => {
            estados.sort((a, b) => a.nome.localeCompare(b.nome));
            ufSelect.innerHTML = '<option value="">Selecione um estado...</option>';
            estados.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.sigla;
                option.textContent = estado.nome;
                ufSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar estados:', error);
            ufSelect.innerHTML = '<option value="">Erro ao carregar estados</option>';
        });
}

function preencherCidades(uf) {
    cidadeSelect.innerHTML = '<option value="">Carregando...</option>';
    cidadeSelect.disabled = true;

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        .then(response => response.json())
        .then(cidades => {
            cidades.sort((a, b) => a.nome.localeCompare(b.nome));
            cidadeSelect.innerHTML = '<option value="">Selecione uma cidade...</option>';
            cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.nome;
                option.textContent = cidade.nome;
                cidadeSelect.appendChild(option);
            });
            cidadeSelect.disabled = false;
        })
        .catch(error => {
            console.error('Erro ao buscar cidades:', error);
            cidadeSelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
        });
}

preencherEstados();

ufSelect.addEventListener('change', (event) => {
    const estadoSelecionado = event.target.value;
    if (estadoSelecionado) {
        preencherCidades(estadoSelecionado);
    } else {
        cidadeSelect.innerHTML = '<option value="">Selecione uma cidade...</option>';
        cidadeSelect.disabled = true;
    }
});

