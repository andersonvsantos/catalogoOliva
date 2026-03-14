const produtosJSON = [
    { id: 1, nome: "Colar Riviera Dourado", categoria: "Colares", desc: "Banho de ouro 18k com zircônias premium.", preco: 289.90, img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600" },
    { id: 2, nome: "Anel Solitário", categoria: "Anéis", desc: "Cristal cravejado em prata 925 legítima.", preco: 159.00, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600" },
    { id: 3, nome: "Brincos de Argola", categoria: "Brincos", desc: "Banho de ouro rosé com acabamento polido.", preco: 85.50, img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600" },
    { id: 4, nome: "Pulseira Veneziana", categoria: "Pulseiras", desc: "Design minimalista em prata com extensor.", preco: 120.00, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600" },
    { id: 5, nome: "Relógio Elegance", categoria: "Relógios", desc: "Pulseira de aço inoxidável e mostrador em quartzo.", preco: 450.90, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600" },
    { id: 6, nome: "Pingente Infinito", categoria: "Colares", desc: "Símbolo em ródio negro com microzircônias.", preco: 75.00, img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600" }
];

let carrinho = JSON.parse(localStorage.getItem('oliva_cart')) || [];
const grid = document.getElementById('catalog-grid');
const cartBadge = document.getElementById('cart-count');
const filterContainer = document.getElementById('category-filters');
let categoriaAtiva = "todos";

// 1. Criar botões de categorias dinamicamente
function renderFilterButtons() {
    const categorias = ["todos", ...new Set(produtosJSON.map(p => p.categoria))];
    
    filterContainer.innerHTML = categorias.map(cat => `
        <button class="filter-btn ${categoriaAtiva === cat ? 'active' : ''}" 
                onclick="filterByCategory('${cat}')">
            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
    `).join('');
}

function filterByCategory(cat) {
    categoriaAtiva = cat;
    renderFilterButtons(); // Atualiza o estado visual do botão
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filtrados = produtosJSON.filter(p => {
        const matchesSearch = p.nome.toLowerCase().includes(searchTerm) || p.desc.toLowerCase().includes(searchTerm);
        const matchesCategory = categoriaAtiva === "todos" || p.categoria === categoriaAtiva;
        return matchesSearch && matchesCategory;
    });
    
    loadCatalog(filtrados);
}

// 2. Modificar loadCatalog para manter consistência
function loadCatalog(items) {
    if (items.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">Nenhum produto encontrado.</p>`;
        return;
    }

    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <div class="img-wrapper"><img src="${p.img}" alt="${p.nome}"></div>
            <div class="product-info">
                <span class="category-tag">${p.categoria}</span>
                <h3>${p.nome}</h3>
                <p>${p.desc}</p>
                <span class="price">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
                <div class="action-container" id="btn-container-${p.id}">
                    ${renderActionButton(p)}
                </div>
            </div>
        </div>
    `).join('');
}

// Escutador da busca atualizado
document.getElementById('search-input').addEventListener('input', applyFilters);

// Funções de Carrinho (Mantidas conforme seu código)
function updateBadge() {
    const totalItems = carrinho.reduce((acc, item) => acc + item.qty, 0);
    cartBadge.innerText = totalItems;
}

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
    return `<button class="add-to-cart" onclick="addToCart(${product.id})">Adicionar ao Carrinho <i class="fa-solid fa-cart-shopping"></i></button>`;
}

function addToCart(id) {
    const produto = produtosJSON.find(p => p.id === id);
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
    applyFilters(); // Importante: reaplica o filtro atual para não "resetar" a visão do usuário
}

// Inicialização
renderFilterButtons();
loadCatalog(produtosJSON);
updateBadge();