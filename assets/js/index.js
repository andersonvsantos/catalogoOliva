const produtosJSON = [
    { 
        id: 1, 
        nome: "Colar Riviera Dourado", 
        desc: "Banho de ouro 18k com zircônias premium.", 
        preco: 289.90, 
        img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600" 
    },
    { 
        id: 2, 
        nome: "Anel Solitário", 
        desc: "Cristal cravejado em prata 925 legítima.", 
        preco: 159.00, 
        img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400" 
    },
    { 
        id: 3, 
        nome: "Brincos de Argola", 
        desc: "Banho de ouro rosé com acabamento polido.", 
        preco: 85.50, 
        img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400" 
    },
    { 
        id: 4, 
        nome: "Pulseira Veneziana", 
        desc: "Design minimalista em prata com extensor.", 
        preco: 120.00, 
        img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400" 
    },
    { 
        id: 5, 
        nome: "Relógio Elegance", 
        desc: "Pulseira de aço inoxidável e mostrador em quartzo.", 
        preco: 450.90, 
        img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=400" 
    },
    { 
        id: 6, 
        nome: "Pingente Infinito", 
        desc: "Símbolo em ródio negro com microzircônias.", 
        preco: 75.00, 
        img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400" 
    }
];

let carrinho = JSON.parse(localStorage.getItem('oliva_cart')) || [];
const grid = document.getElementById('catalog-grid');
const cartBadge = document.getElementById('cart-count');

function updateBadge() {
    const totalItems = carrinho.reduce((acc, item) => acc + item.qty, 0);
    cartBadge.innerText = totalItems;
}

function loadCatalog(items) {
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <div class="img-wrapper"><img src="${p.img}" alt="${p.nome}"></div>
            <div class="product-info">
                <h3>${p.nome}</h3>
                <p>${p.desc}</p>
                <span class="price">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
                <button class="add-to-cart" onclick="addToCart(${p.id})">
                    Adicionar ao carrinho <i class="fa-solid fa-cart-shopping"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addToCart(id) {
    const produto = produtosJSON.find(p => p.id === id);
    const itemExistente = carrinho.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.qty++;
    } else {
        carrinho.push({ ...produto, qty: 1 });
    }

    localStorage.setItem('oliva_cart', JSON.stringify(carrinho));
    updateBadge();

    cartBadge.style.transform = "scale(1.4)";
    setTimeout(() => cartBadge.style.transform = "scale(1)", 200);
}

document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = produtosJSON.filter(p => p.nome.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term));
    loadCatalog(filtered);
});

loadCatalog(produtosJSON);
updateBadge();