
// Função para manipular o logout
function handleLogout(event) {
    event.preventDefault();
    
    // Remove a sessão do usuário do sessionStorage
    sessionStorage.removeItem('usuarioLogado');
    
    alert('Você saiu da sua conta com sucesso!');
    
    // Redireciona para a página de login
    window.location.href = 'login.html';
}

// Função para verificar o status de login e atualizar a navegação
function checkLoginStatus() {
    const userArea = document.getElementById('user-area');
    const cadastroLink = document.querySelector('a[href="cadastro.html"]');

    // Certifica-se de que estamos em uma página com a barra de navegação
    if (!userArea) return;
    
    // Verifica se existe um usuário logado no sessionStorage
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    const isLoggedIn = usuarioLogado !== null;
    
    if (isLoggedIn) {
        // Parse dos dados do usuário
        const usuario = JSON.parse(usuarioLogado);
        
        // Se logado, renderiza o nome do usuário e o link de 'Logout'
        userArea.innerHTML = `
            <span class="text-white me-3">Olá, ${usuario.nome}!</span>
            <a class="nav-link text-white d-inline" href="#" id="logout-link">
                <i class="bi bi-box-arrow-right"></i> Logout
            </a>
        `;
        
        // Adiciona o listener para o clique no 'logout'
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', handleLogout);
        }
        
        // Exibe o link "cadastrar local" para usuários logados
        if (cadastroLink) {
            cadastroLink.style.display = 'block';
        }
        
    } else {
        // Se não logado, renderiza o link de 'Login'
        userArea.innerHTML = `
            <a class="nav-link text-white" href="login.html">
                <i class="bi bi-box-arrow-in-right"></i> Login
            </a>
        `;
        
        // Esconde o link "cadastrar local" para usuários não logados
        if (cadastroLink) {
            cadastroLink.style.display = 'none';
        }
    }
}

// Função para proteger páginas que exigem login
function protegerPagina() {
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    
    if (!usuarioLogado) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
    }
}

// Executa a verificação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Exporta funções para uso em outras páginas
if (typeof window !== 'undefined') {
    window.protegerPagina = protegerPagina;
    window.checkLoginStatus = checkLoginStatus;
}