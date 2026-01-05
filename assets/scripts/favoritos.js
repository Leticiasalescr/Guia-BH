// favoritos.js - Sistema de gerenciamento de favoritos

// Obter favoritos do usuário logado
function obterFavoritos() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) return [];
    
    const chave = `favoritos_${usuario.id}`;
    return JSON.parse(localStorage.getItem(chave)) || [];
}

// Salvar favoritos do usuário logado
function salvarFavoritos(favoritos) {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) {
        alert('Você precisa estar logado para adicionar favoritos.');
        return false;
    }
    
    const chave = `favoritos_${usuario.id}`;
    localStorage.setItem(chave, JSON.stringify(favoritos));
    return true;
}

// Verificar se um local está nos favoritos
function estaNosFavoritos(localId) {
    const favoritos = obterFavoritos();
    return favoritos.some(fav => fav.id === localId);
}

// Adicionar local aos favoritos
function adicionarFavorito(local) {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuario) {
        if (confirm('Você precisa fazer login para adicionar favoritos! Deseja ir para a página de login?')) {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    const favoritos = obterFavoritos();
    
    // Verificar se já está nos favoritos
    if (estaNosFavoritos(local.id)) {
        alert('Este local já está nos seus favoritos!');
        return false;
    }
    
    // Adicionar informações extras
    const favorito = {
        ...local,
        dataAdicionado: new Date().toISOString()
    };
    
    favoritos.push(favorito);
    
    if (salvarFavoritos(favoritos)) {
        alert(`${local.nome} foi adicionado aos favoritos!`);
        atualizarIconesFavoritos();
        atualizarContadorFavoritos();
        return true;
    }
    
    return false;
}

// Remover local dos favoritos
function removerFavorito(localId) {
    if (!confirm('Deseja remover este local dos favoritos?')) {
        return false;
    }
    
    let favoritos = obterFavoritos();
    const localRemovido = favoritos.find(fav => fav.id === localId);
    favoritos = favoritos.filter(fav => fav.id !== localId);
    
    if (salvarFavoritos(favoritos)) {
        if (localRemovido) {
            alert(`${localRemovido.nome} foi removido dos favoritos!`);
        }
        atualizarIconesFavoritos();
        atualizarContadorFavoritos();
        return true;
    }
    
    return false;
}

// Alternar favorito (adicionar ou remover)
function toggleFavorito(local) {
    if (estaNosFavoritos(local.id)) {
        return removerFavorito(local.id);
    } else {
        return adicionarFavorito(local);
    }
}

// Atualizar ícones de favoritos na página
function atualizarIconesFavoritos() {
    const botoesCoracoes = document.querySelectorAll('[data-local-id]');
    
    botoesCoracoes.forEach(botao => {
        const localId = parseInt(botao.getAttribute('data-local-id'));
        const isFavorito = estaNosFavoritos(localId);
        const icone = botao.querySelector('i');
        
        if (icone) {
            if (isFavorito) {
                icone.classList.remove('bi-heart');
                icone.classList.add('bi-heart-fill');
                botao.classList.add('text-danger');
            } else {
                icone.classList.remove('bi-heart-fill');
                icone.classList.add('bi-heart');
                botao.classList.remove('text-danger');
            }
        }
    });
}

// Obter contador de favoritos
function contarFavoritos() {
    return obterFavoritos().length;
}

// Atualizar contador de favoritos no menu
function atualizarContadorFavoritos() {
    // Buscar o link de favoritos - pode estar em diferentes páginas
    const linkFavoritos = document.querySelector('a.nav-link[href="favoritos.html"]') || 
                          document.querySelector('a[href="favoritos.html"]');
    
    if (linkFavoritos) {
        const contador = contarFavoritos();
        
        // Remover badge existente se houver
        const badgeExistente = linkFavoritos.querySelector('.badge');
        if (badgeExistente) {
            badgeExistente.remove();
        }
        
        // Obter texto original sem o badge
        let textoOriginal = linkFavoritos.textContent.trim();
        
        if (contador > 0) {
            // Adicionar badge com contador
            linkFavoritos.innerHTML = `Ver favoritos <span class="badge bg-danger ms-1">${contador}</span>`;
        } else {
            linkFavoritos.textContent = 'Ver favoritos';
        }
    }
}

// Inicializar sistema de favoritos
document.addEventListener('DOMContentLoaded', function() {
    // Pequeno delay para garantir que o DOM está totalmente carregado
    setTimeout(() => {
        atualizarIconesFavoritos();
        atualizarContadorFavoritos();
    }, 100);
});