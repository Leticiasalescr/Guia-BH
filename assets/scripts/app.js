// configuração da url da api
const API_URL = 'http://localhost:3000/lugares';
let lugaresData = []; // armazena dados para pesquisa/filtro

// carregar cards da api
async function carregarCardsDaAPI() {
    try {
        const resposta = await fetch(API_URL); 
        
        if (!resposta.ok) {
            console.warn('api não está rodando');
            mostrarMensagemErroAPI();
            return;
        }
        
        // salva os dados na variável global
        lugaresData = await resposta.json(); 
        criarCard(lugaresData);
        
        // atualizar ícones de favoritos após carregar os cards
        setTimeout(() => {
            atualizarIconesFavoritos();
        }, 100);
        
    } catch (erro) {
        console.warn('erro ao conectar com api:', erro);
        mostrarMensagemErroAPI();
    }
}

// mostrar mensagem de erro da api
function mostrarMensagemErroAPI() {
    const placesGrid = document.getElementById('places-grid');
    if (!placesGrid) return;
    
    placesGrid.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger text-center">
                <h4>erro ao conectar com o servidor</h4>
                <p><strong>para fazer funcionar:</strong></p>
                <ol class="text-start" style="max-width: 600px; margin: 0 auto;">
                    <li>abra o terminal na pasta do projeto</li>
                    <li>execute: <code>json-server --watch db.json</code></li>
                    <li>recarregue esta página</li>
                </ol>
                <hr>
                <a href="cadastro.html" class="btn btn-success mt-2">cadastrar primeiro local</a>
            </div>
        </div>
    `;
}

// deletar lugar
async function deletarLugar(id) {
    if (!confirm('tem certeza que deseja excluir este local?')) {
        return; 
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'delete',
        });

        if (!resposta.ok) {
            throw new Error(`erro ao excluir: status ${resposta.status}`);
        }

        alert('local excluído com sucesso!');
        // recarrega a lista após excluir
        carregarCardsDaAPI(); 

    } catch (erro) {
        console.error('falha na exclusão:', erro);
        alert('erro ao excluir! verifique se o json server está rodando.');
    }
}

// carregar detalhes de um lugar
async function carregarDetalhesDaAPI() {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id'); 

    if (!itemId) {
        document.getElementById('detalhe-container').innerHTML = `
             <div class="alert alert-danger" role="alert">
                <h4>id do local não especificado!</h4>
             </div>
             <a href="index.html" class="btn btn-info mt-3">voltar para a home</a>
        `;
        return; 
    }

    try {
        const resposta = await fetch(`${API_URL}/${itemId}`);
        
        if (resposta.status === 404) {
             throw new Error("local não encontrado (404)");
        }
        if (!resposta.ok) {
            throw new Error(`erro ao buscar detalhes: status ${resposta.status}`);
        }
        
        const item = await resposta.json();
        renderizarDetalhes(item);
        
    } catch (erro) {
        console.error('erro ao carregar detalhes:', erro);
        document.getElementById('detalhe-container').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4>erro ao carregar detalhes</h4>
                <p>verifique se o json server está rodando.</p>
            </div>
            <a href="index.html" class="btn btn-info mt-3">voltar para a home</a>
        `;
    }
}

// criar cards na home
function criarCard(dados) {
    const placesGrid = document.getElementById('places-grid');
    if (!placesGrid) return; 

    placesGrid.innerHTML = ''; 

    if (!dados || dados.length === 0) {
        placesGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <h4>nenhum local encontrado</h4>
                    <p>tente outra pesquisa ou categoria.</p>
                    <a href="cadastro.html" class="btn btn-success">cadastrar local</a>
                </div>
            </div>
        `;
        return;
    }

    dados.forEach(item => {
        const article = document.createElement('article');
        article.classList.add('col');
        
        // normalizar dados para o formato esperado pelos favoritos
        const localNormalizado = {
            id: item.id,
            nome: item.local,
            endereco: item.cidade,
            descricao: item.descricao,
            categoria: item.categoria,
            imagem: item.imagem,
            link_mapa: item.link_mapa
        };
        
        // lógica de múltiplas categorias para exibição 
        const categoriasList = item.categoria ? item.categoria.split(',').map(c => c.trim()) : [];
        const categoriasBadges = categoriasList.map(cat => `<span class="badge bg-success mb-2 me-1">${cat}</span>`).join('');
        
        article.innerHTML = `
            <div class="card h-100 shadow-sm position-relative">
                <button class="btn btn-link position-absolute top-0 end-0 m-2 p-2 bg-white rounded-circle shadow-sm" 
                        style="z-index: 10; width: 40px; height: 40px;"
                        onclick='handleFavorito(${JSON.stringify(localNormalizado)})'
                        data-local-id="${item.id}"
                        title="adicionar aos favoritos">
                    <i class="bi bi-heart fs-5"></i>
                </button>
                
                <a href="detalhes.html?id=${item.id}" class="text-decoration-none text-dark">
                    <img src="${item.imagem}" 
                         class="card-img-top" 
                         alt="${item.local}"
                         onerror="this.src='https://via.placeholder.com/400x300?text=imagem+indisponivel'"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h4 class="card-title">${item.local}</h4>
                        <p class="text-muted mb-2">
                             ${item.cidade}
                        </p>
                        <div class="mb-2">${categoriasBadges}</div>
                        
                        <p class="card-text">${item.descricao.length > 120 ? item.descricao.substring(0,120)+'...' : item.descricao}</p>
                    </div>
                </a>
                <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <a class="btn btn-primary btn-sm" href="${item.link_mapa}" target="_blank" rel="noopener noreferrer">
                        ver no mapa
                    </a>
                    
                    <div class="btn-group" role="group">
                        <a class="btn btn-warning btn-sm" href="detalhes.html?id=${item.id}">
                            detalhes
                        </a>
                        <button class="btn btn-danger btn-sm" onclick="deletarLugar('${item.id}')">
                            excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
        placesGrid.appendChild(article);
    });
}

// handler para o botão de favorito
function handleFavorito(local) {
    // evita que o clique abra os detalhes
    event.stopPropagation(); 
    toggleFavorito(local);
}

// renderizar detalhes (com botão de favorito)
function renderizarDetalhes(item) {
    document.getElementById('titulo-pagina').textContent = `${item.local} - guia bh`;
    document.getElementById('detalhe-local').textContent = item.local;
    document.getElementById('detalhe-imagem').src = item.imagem;
    document.getElementById('detalhe-imagem').alt = `imagem de ${item.local}`;
    document.getElementById('detalhe-descricao').textContent = item.descricao;
    document.getElementById('detalhe-cidade').textContent = item.cidade;
    document.getElementById('detalhe-mapa-link').href = item.link_mapa;
    
    // --- lógica de múltiplas categorias para detalhes ---
    const categoriasList = item.categoria ? item.categoria.split(',').map(c => c.trim()) : [];
    const categoriasBadges = categoriasList.map(cat => `<span class="badge bg-success mb-3 me-1">${cat}</span>`).join('');
    document.getElementById('detalhe-categoria-badges').innerHTML = categoriasBadges;
    // --------------------------------------------------
    
    // normalizar dados para o formato esperado pelos favoritos
    const localNormalizado = {
        id: item.id,
        nome: item.local,
        endereco: item.cidade,
        descricao: item.descricao,
        categoria: item.categoria,
        imagem: item.imagem,
        link_mapa: item.link_mapa
    };

    // adiciona o botão de favorito na página de detalhes
    const favoritoButtonContainer = document.getElementById('detalhe-favorito-container');
    if (favoritoButtonContainer) {
         favoritoButtonContainer.innerHTML = `
            <button class="btn btn-warning btn-lg" 
                    onclick='toggleFavorito(${JSON.stringify(localNormalizado)})'
                    data-local-id="${item.id}"
                    title="adicionar aos favoritos">
                <i class="bi bi-heart me-2"></i> favorito
            </button>
        `;
        // garante que o ícone reflita o status salvo
        atualizarIconesFavoritos();
    }
    
    carregarGaleria(item);
}

// nova função para filtrar cards (pesquisa e categoria)
function filtrarLugares(event) {
    const termo = document.getElementById('search').value.toLowerCase().trim();
    let categoria = document.getElementById('categoria-select').value;
    
    // se o evento veio de um botão de categoria, usa o data-filter
    if (event && event.target.closest('button')) {
        categoria = event.target.closest('button').getAttribute('data-filter');
        // opcional: atualiza o seletor dropdown para refletir
        document.getElementById('categoria-select').value = categoria;
    }
    
    // remove a classe 'active' de todos os botões e adiciona ao botão clicado
    const categoriaButtons = document.querySelectorAll('#categorias-container button');
    categoriaButtons.forEach(btn => btn.classList.remove('active'));
    if (event && event.target.closest('button')) {
         event.target.closest('button').classList.add('active');
    }

    let dadosFiltrados = lugaresData.filter(item => {
        // --- lógica de filtro para múltiplas categorias ---
        const categoriaItem = item.categoria ? item.categoria.toLowerCase() : '';
        const itemCategorias = categoriaItem.split(',').map(c => c.trim());
        
        const filtraPorCategoria = categoria === 'todas' || itemCategorias.includes(categoria);
        // --------------------------------------------------
        
        // filtro secundário: termo de pesquisa (título ou descrição)
        const filtraPorTermo = termo === '' || 
                               item.local.toLowerCase().includes(termo) || 
                               item.descricao.toLowerCase().includes(termo);
        
        return filtraPorCategoria && filtraPorTermo;
    });

    criarCard(dadosFiltrados);
}

// carregar galeria
function carregarGaleria(item) {
    const galeria = document.getElementById('galeria-fotos');
    if (!galeria) return;

    const col = document.createElement('div');
    col.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mb-3');
    col.innerHTML = `
        <div class="card h-100">
            <img src="${item.imagem}" class="card-img-top" alt="${item.local}">
            <div class="card-body">
                <h5 class="card-title">${item.local}</h5>
            </div>
        </div>
    `;
    galeria.appendChild(col);
}

// carrossel 
let slideIndex = 1;

function plusSlides(n) { 
    showSlides(slideIndex += n); 
}

function showSlides(n) {
    let slides = document.getElementsByClassName("carousel-slide");
    if (slides.length === 0) return;
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].style.opacity = "0";
    }
    
    slides[slideIndex - 1].style.display = "block";
    slides[slideIndex - 1].style.opacity = "1";
}

// iniciar carrossel
if (document.querySelector('.carousel-slide')) {
    showSlides(slideIndex);
    setInterval(() => { plusSlides(1); }, 5000);
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    // identificar página e carregar conteúdo apropriado
    if (document.body.id === 'detalhes-page') {
        carregarDetalhesDaAPI();
    } else if (document.body.id === 'cadastro-page') {
        // página de cadastro - formulário será tratado abaixo
    } else {
        // home - carregar cards e configurar filtros
        carregarCardsDaAPI(); 
        
        // listener para o campo de pesquisa
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', filtrarLugares);
        }

        // listener para o filtro de categoria dropdown
        const categoriaSelect = document.getElementById('categoria-select');
        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', filtrarLugares);
        }
        
        // listener para os botões de categoria (retângulos)
        const categoriasContainer = document.getElementById('categorias-container');
        if (categoriasContainer) {
             categoriasContainer.querySelectorAll('button').forEach(button => {
                 button.addEventListener('click', filtrarLugares);
             });
             // define o botão 'todas' como ativo inicialmente
             document.querySelector('#categorias-container button[data-filter="todas"]').classList.add('active');
        }
    }
    
    // formulário de cadastro
    const formCadastro = document.getElementById('form-cadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const botaoSubmit = formCadastro.querySelector('button[type="submit"]');
            const textoOriginal = botaoSubmit.innerHTML;
            botaoSubmit.innerHTML = 'salvando...';
            botaoSubmit.disabled = true;
            
            const novoLugar = {
                local: document.getElementById('local').value.trim(),
                cidade: document.getElementById('cidade').value.trim(),
                descricao: document.getElementById('descricao').value.trim(),
                // nota: o campo categoria deve ser preenchido no formato 'cat1, cat2, cat3'
                categoria: document.getElementById('categoria').value, 
                imagem: document.getElementById('imagem').value.trim(),
                link_mapa: document.getElementById('link_mapa').value.trim(),
            };

            try {
                const resposta = await fetch(API_URL, {
                    method: 'post', 
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(novoLugar) 
                });

                if (!resposta.ok) {
                    throw new Error(`erro ao cadastrar: status ${resposta.status}`);
                }

                const lugarCriado = await resposta.json();
                
                alert(`lugar "${lugarCriado.local}" cadastrado com sucesso!`);
                formCadastro.reset();
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } catch (erro) {
                console.error('falha no cadastro:', erro);
                alert('erro ao cadastrar! verifique se o json server está rodando: json-server --watch db.json');
                
                botaoSubmit.innerHTML = textoOriginal;
                botaoSubmit.disabled = false;
            }
        });
    }
});