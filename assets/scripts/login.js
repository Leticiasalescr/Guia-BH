
document.addEventListener('DOMContentLoaded', function() {
    const loginView = document.getElementById('login-view');
    const cadastroView = document.getElementById('cadastro-view');
    const formTitle = document.getElementById('form-title');
    const linkParaCadastro = document.getElementById('link-para-cadastro');
    const linkParaLogin = document.getElementById('link-para-login');
    const formLogin = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro-usuario');

    // alternar entre login e cadastro
    linkParaCadastro.addEventListener('click', function(e) {
        e.preventDefault();
        loginView.style.display = 'none';
        cadastroView.style.display = 'block';
        formTitle.textContent = 'cadastro no guia bh';
    });

    linkParaLogin.addEventListener('click', function(e) {
        e.preventDefault();
        cadastroView.style.display = 'none';
        loginView.style.display = 'block';
        formTitle.textContent = 'login no guia bh';
    });

    // processar cadastro
    formCadastro.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome-cadastro').value.trim();
        const email = document.getElementById('email-cadastro').value.trim();
        const login = document.getElementById('login-cadastro').value.trim();
        const senha = document.getElementById('senha-cadastro').value;

        // validações básicas
        if (!nome || !email || !login || !senha) {
            alert('por favor, preencha todos os campos.');
            return;
        }

        if (senha.length < 6) {
            alert('a senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // obter usuários existentes
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        // verificar se login já existe
        if (usuarios.some(u => u.login === login)) {
            alert('este usuário já está cadastrado. escolha outro nome de usuário.');
            return;
        }

        // verificar se email já existe
        if (usuarios.some(u => u.email === email)) {
            alert('este email já está cadastrado.');
            return;
        }

        // criar novo usuário
        const novoUsuario = {
            id: Date.now(),
            nome: nome,
            email: email,
            login: login,
            senha: senha, // em produção, use hash de senha!
            dataCadastro: new Date().toISOString()
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        alert('cadastro realizado com sucesso! faça login para continuar.');
        
        // limpar formulário e voltar para login
        formCadastro.reset();
        cadastroView.style.display = 'none';
        loginView.style.display = 'block';
        formTitle.textContent = 'login no guia bh';
    });

    // processar login
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const login = document.getElementById('login-input').value.trim();
        const senha = document.getElementById('senha-input').value;

        if (!login || !senha) {
            alert('por favor, preencha todos os campos.');
            return;
        }

        // obter usuários
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        // buscar usuário
        const usuario = usuarios.find(u => u.login === login && u.senha === senha);

        if (usuario) {
            // salvar sessão (correção: usa sessionstorage)
            const sessao = {
                id: usuario.id,
                nome: usuario.nome,
                login: usuario.login,
                email: usuario.email,
                loginTime: new Date().toISOString()
            };
            
            sessionStorage.setItem('usuarioLogado', JSON.stringify(sessao));
            
            alert(`bem-vindo(a), ${usuario.nome}!`);
            
            // redirecionar para home
            window.location.href = 'index.html';
        } else {
            alert('usuário ou senha incorretos.');
        }
    });
});