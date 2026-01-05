// Configuração da URL da API
const API_URL = 'http://localhost:3000/lugares';
let meuGrafico = null;

// Carregar dados dos melhores avaliados
async function carregarDadosMelhores() {
    const loadingMsg = document.getElementById('loading-message');
    const errorMsg = document.getElementById('error-message');
    
    try {
        const resposta = await fetch(API_URL);
        
        if (!resposta.ok) {
            throw new Error('API não disponível');
        }
        
        const lugares = await resposta.json();
        
        loadingMsg.classList.add('d-none');
        
        if (!lugares || lugares.length === 0) {
            errorMsg.classList.remove('d-none');
            errorMsg.innerHTML = `
                <h4>Nenhum local cadastrado ainda</h4>
                <p>Seja o primeiro a cadastrar!</p>
                <a href="cadastro.html" class="btn btn-success">Cadastrar Local</a>
            `;
            return;
        }
        
        processarDados(lugares);
        
    } catch (erro) {
        console.error('Erro ao carregar:', erro);
        loadingMsg.classList.add('d-none');
        errorMsg.classList.remove('d-none');
    }
}

// Processar dados para gráfico e ranking
function processarDados(lugares) {
    const contagemPorCategoria = {};
    
    lugares.forEach(lugar => {
        const cat = lugar.categoria || 'outros';
        contagemPorCategoria[cat] = (contagemPorCategoria[cat] || 0) + 1;
    });
    
    const categoriasOrdenadas = Object.entries(contagemPorCategoria)
        .sort((a, b) => b[1] - a[1]);
    
    criarGrafico(categoriasOrdenadas);
    criarRankingCards(lugares);
}

// Criação do gráfico
function criarGrafico(dados) {
    const ctx = document.getElementById('grafico-melhores');
    
    if (meuGrafico) {
        meuGrafico.destroy();
    }
    
    const labels = dados.map(item => item[0].charAt(0).toUpperCase() + item[0].slice(1));
    const valores = dados.map(item => item[1]);
    
    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Lugares',
                data: valores,
                backgroundColor: [
                    'rgba(59, 83, 57, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(139, 195, 74, 0.8)',
                    'rgba(205, 220, 57, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                ],
                borderColor: [
                    'rgba(59, 83, 57, 1)',
                    'rgba(76, 175, 80, 1)',
                    'rgba(139, 195, 74, 1)',
                    'rgba(205, 220, 57, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(255, 152, 0, 1)',
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Categorias Mais Populares em BH',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// criar cards de ranking
function criarRankingCards(lugares) {
    const container = document.getElementById('ranking-cards');
    container.innerHTML = '';
    
    const lugaresOrdenados = [...lugares].sort((a, b) => {
        return a.local.localeCompare(b.local);
    });
    
    lugaresOrdenados.forEach((lugar, index) => {
        let iconeRanking = '';
        if (index === 0) iconeRanking = '<i class="bi bi-trophy-fill text-warning fs-4"></i>';
        else if (index === 1) iconeRanking = '<i class="bi bi-trophy-fill text-secondary fs-4"></i>';
        else if (index === 2) iconeRanking = '<i class="bi bi-trophy-fill text-danger fs-4"></i>';
        else iconeRanking = `<span class="badge bg-primary">#${index + 1}</span>`;
        
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${lugar.imagem}" 
                     class="card-img-top" 
                     alt="${lugar.local}"
                     onerror="this.src='https://via.placeholder.com/400x300?text=Sem+Imagem'"
                     style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${lugar.local}</h5>
                        ${iconeRanking}
                    </div>
                    <p class="text-muted mb-2">
                        <i class="bi bi-geo-alt-fill"></i> ${lugar.cidade}
                    </p>
                    <span class="badge bg-success mb-2">${lugar.categoria}</span>
                    <p class="card-text">${lugar.descricao.substring(0, 100)}...</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <div class="btn-group w-100" role="group">
                        <a href="detalhes.html?id=${lugar.id}" class="btn btn-primary btn-sm">
                            <i class="bi bi-eye"></i> Detalhes
                        </a>
                        <a href="editar.html?id=${lugar.id}" class="btn btn-warning btn-sm">
                            <i class="bi bi-pencil"></i> Editar
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// filtro por categoria
document.getElementById('filtro-categoria')?.addEventListener('change', async (e) => {
    const categoriaEscolhida = e.target.value;
    const loadingMsg = document.getElementById('loading-message');
    
    loadingMsg.classList.remove('d-none');
    
    try {
        const resposta = await fetch(API_URL);
        const lugares = await resposta.json();
        
        let lugaresFiltrados = lugares;
        
        if (categoriaEscolhida !== 'todas') {
            lugaresFiltrados = lugares.filter(l => l.categoria === categoriaEscolhida);
        }
        
        loadingMsg.classList.add('d-none');
        
        if (lugaresFiltrados.length === 0) {
            document.getElementById('ranking-cards').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <h5>Nenhum lugar encontrado nesta categoria</h5>
                        <p>Tente outra categoria!</p>
                    </div>
                </div>
            `;
            return;
        }
        
        processarDados(lugaresFiltrados);
        
    } catch (erro) {
        console.error('Erro no filtro:', erro);
        loadingMsg.classList.add('d-none');
    }
});

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosMelhores();
});