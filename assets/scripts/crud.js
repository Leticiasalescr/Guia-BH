const API_URL = 'http://localhost:3000/lugares'; 
let itemId = null;

// Elementos da página editar.html
const form = document.getElementById('form-editar'); 
const botaoExcluir = document.getElementById('botao-excluir-item'); 

// Carregar dados do item para editar (GET)
async function carregarDadosItem() {
    try {
        const resposta = await fetch(`${API_URL}/${itemId}`);

        if (!resposta.ok) {
            throw new Error('Local não encontrado');
        }

        const item = await resposta.json();

        // Preencher formulário
        document.getElementById('local').value = item.local;
        document.getElementById('cidade').value = item.cidade;
        document.getElementById('descricao').value = item.descricao;
        document.getElementById('categoria').value = item.categoria;
        document.getElementById('imagem').value = item.imagem;
        document.getElementById('link_mapa').value = item.link_mapa;
        
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        alert('Erro ao carregar dados do local!');
        window.location.href = 'index.html';
    }
}

// Salvar Item (PUT)
async function salvarItem(evento) {
    evento.preventDefault();

    const botaoSubmit = evento.target.querySelector('button[type="submit"]');
    const textoOriginal = botaoSubmit.innerHTML;
    botaoSubmit.innerHTML = '<i class="bi bi-hourglass-split"></i> Salvando...';
    botaoSubmit.disabled = true;

    // Criar o objeto com os dados do formulário
    const itemASalvar = {
        local: document.getElementById('local').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        descricao: document.getElementById('descricao').value.trim(),
        categoria: document.getElementById('categoria').value,
        imagem: document.getElementById('imagem').value.trim(),
        link_mapa: document.getElementById('link_mapa').value.trim(),
    };

    // Método 'PUT' 
    const url = `${API_URL}/${itemId}`;
    const acao = 'atualizado';

    try {
        const resposta = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemASalvar)
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao ${acao}`);
        }

        alert(`Local ${acao} com sucesso!`);
        window.location.href = 'index.html'; 

    } catch (erro) {
        console.error('Erro ao salvar:', erro);
        alert(`Erro ao ${acao}! Verifique o JSON Server.`);
        botaoSubmit.innerHTML = textoOriginal;
        botaoSubmit.disabled = false;
    }
}

// Excluir Item (DELETE)
async function excluirItem() {
    if (!itemId || !confirm('Tem certeza que deseja EXCLUIR permanentemente este local?')) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${itemId}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            throw new Error('Erro ao excluir');
        }

        alert('Local excluído com sucesso!');
        window.location.href = 'index.html'; // Redireciona para a home

    } catch (erro) {
        console.error('Erro ao excluir:', erro);
        alert('Erro ao excluir o local!');
    }
}

// Inicialização e Configuração
document.addEventListener('DOMContentLoaded', () => {
    // Tenta obter o ID da URL
    const params = new URLSearchParams(window.location.search);
    itemId = params.get('id');

    if (itemId) {
        // Modo Edição (Update)
        document.querySelector('h2').textContent = 'Editar Local';
        carregarDadosItem();
        
        // Adiciona evento ao botão de Excluir
        if (botaoExcluir) {
            botaoExcluir.addEventListener('click', excluirItem);
        }
    } else {
        // Se a página de edição for acessada sem ID, é um erro 
        alert('ID do local não especificado para edição.');
        window.location.href = 'index.html'; 
    }

    // Configura 'form-editar' para chamar a função Salvar
    if (form) {
        form.addEventListener('submit', salvarItem);
    }
});