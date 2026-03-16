const API_URL = "api/produtos";
let carrinho = JSON.parse(localStorage.getItem('oliva_cart')) || [];
let produtosDaAPI = []; // Guardaremos os produtos aqui para busca e filtros
let categoriaAtiva = "todos";

const grid = document.getElementById('catalog-grid');
const cartBadge = document.getElementById('cart-count');

// 1. Carregar produtos do servidor
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        produtosDaAPI = await response.json();
        
        renderFilterButtons();
        applyFilters();
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        grid.innerHTML = "<p>Erro ao conectar com o servidor.</p>";
    }
}

// 2. Filtros e Categorias
function renderFilterButtons() {
    const filterContainer = document.getElementById('category-filters');
    const categorias = ["todos", ...new Set(produtosDaAPI.map(p => p.categoria))];
    
    filterContainer.innerHTML = categorias.map(cat => `
        <button class="filter-btn ${categoriaAtiva === cat ? 'active' : ''}" 
                onclick="setCategory('${cat}')">
            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
    `).join('');
}

function setCategory(cat) {
    categoriaAtiva = cat;
    renderFilterButtons();
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filtrados = produtosDaAPI.filter(p => {
        const matchesSearch = p.nome.toLowerCase().includes(searchTerm) || (p.desc && p.desc.toLowerCase().includes(searchTerm));
        const matchesCategory = categoriaAtiva === "todos" || p.categoria === categoriaAtiva;
        return matchesSearch && matchesCategory;
    });
    
    loadCatalog(filtrados);
}

// 3. Renderizar na Tela (ESTRUTURA CORRIGIDA AQUI)
function loadCatalog(items) {
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <div class="img-wrapper">
                <img src="${p.img}" alt="${p.nome}">
            </div>
            <div class="product-info">
                <span class="category-tag">${p.categoria}</span>
                <h3>${p.nome}</h3>
                <p>${p.desc || ""}</p>
                <span class="price">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="action-container" id="btn-container-${p.id}">
                ${renderActionButton(p)}
            </div>
        </div>
    `).join('');
}

// 4. Lógica do Carrinho
function renderActionButton(product) {
    const itemInCart = carrinho.find(item => item.id === product.id);
    if (itemInCart) {
        return `
            <div class="item-qty-selector">
                <button onclick="changeQtyIndex(${product.id}, -1)">-</button>
                <span>${itemInCart.qty}</span>
                <button onclick="changeQtyIndex(${product.id}, 1)">+</button>
            </div>
        `;
    }
    return `<button class="add-to-cart" onclick="addToCart(${product.id})">Adicionar <i class="fa-solid fa-cart-shopping"></i></button>`;
}

function addToCart(id) {
    const produto = produtosDaAPI.find(p => p.id === id);
    carrinho.push({ ...produto, qty: 1 });
    saveAndUpdate();
}

function changeQtyIndex(id, delta) {
    const index = carrinho.findIndex(item => item.id === id);
    if (index !== -1) {
        carrinho[index].qty += delta;
        if (carrinho[index].qty <= 0) carrinho.splice(index, 1);
        saveAndUpdate();
    }
}

function saveAndUpdate() {
    localStorage.setItem('oliva_cart', JSON.stringify(carrinho));
    updateBadge();
    applyFilters();
}

function updateBadge() {
    const total = carrinho.reduce((acc, item) => acc + item.qty, 0);
    cartBadge.innerText = total;
}

// Eventos e Inicialização
document.getElementById('search-input').addEventListener('input', applyFilters);
fetchProducts();
updateBadge();