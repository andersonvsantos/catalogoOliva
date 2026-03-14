let carrinho = JSON.parse(localStorage.getItem('oliva_cart')) || [];
const listElement = document.getElementById('cart-items-list');

function renderCart() {
    if (carrinho.length === 0) {
        listElement.innerHTML = "<p style='padding: 20px 0;'>Seu carrinho está vazio.</p>";
        updateTotals();
        return;
    }

    listElement.innerHTML = carrinho.map((item, index) => `
        <div class="cart-item">
            <img src="${item.img}" class="item-img">
            <div class="item-info">
                <h3>${item.nome}</h3>
                <p>Unitário: R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                <button class="remove-btn" onclick="removeItem(${index})">Remover</button>
            </div>
            <div class="item-qty">
                <button onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
            </div>
            <div class="item-price">R$ ${(item.preco * item.qty).toFixed(2).replace('.', ',')}</div>
        </div>
    `).join('');
    updateTotals();
}

function changeQty(index, delta) {
    const novaQuantidade = carrinho[index].qty + delta;

    if (novaQuantidade > 0) {
        // Se a nova quantidade for maior que zero, apenas atualiza
        carrinho[index].qty = novaQuantidade;
        saveAndRender();
    } else {
        // Se chegar a zero, remove o item do carrinho
        removeItem(index);
        exibirAviso("Item removido do carrinho");
    }
}

function removeItem(index) {
    carrinho.splice(index, 1);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('oliva_cart', JSON.stringify(carrinho));
    renderCart();
}

function updateTotals() {
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.qty), 0);
    document.getElementById('subtotal').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('total').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Função para criar e exibir o aviso elegante
function exibirAviso(mensagem) {
    // Cria o elemento se não existir
    let toast = document.getElementById('toast-aviso');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-aviso';
        toast.className = 'toast-aviso';
        document.body.appendChild(toast);
    }
    
    toast.innerText = mensagem;
    toast.classList.add('show');
    
    // Esconde após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Sua função de finalizar pedido atualizada
function finalizarPedido() {
    if (carrinho.length === 0) {
        exibirAviso("Seu carrinho está vazio!"); // Substituído o alert
        return;
    }

    const meuNumero = "5511983606737"; 

    let mensagem = `*Novo Pedido - Oliva*%0A`;
    mensagem += `----------------------------%0A`;

    carrinho.forEach(item => {
        const subtotalItem = (item.preco * item.qty).toFixed(2).replace('.', ',');
        mensagem += `*${item.qty}x* ${item.nome}%0A`;
        mensagem += `Subtotal: R$ ${subtotalItem}%0A%0A`;
    });

    const totalGeral = carrinho.reduce((sum, item) => sum + (item.preco * item.qty), 0);
    mensagem += `----------------------------%0A`;
    mensagem += `*Total do Pedido: R$ ${totalGeral.toFixed(2).replace('.', ',')}*%0A`;
    mensagem += `----------------------------%0A`;
    mensagem += `%0A_Por favor, informe o endereço de entrega._`;

    const linkWhatsApp = `https://wa.me/${meuNumero}?text=${mensagem}`;
    
    window.open(linkWhatsApp, '_blank');
}

renderCart();