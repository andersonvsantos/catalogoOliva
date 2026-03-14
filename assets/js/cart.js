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
    if (carrinho[index].qty + delta > 0) {
        carrinho[index].qty += delta;
        saveAndRender();
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

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    // 1. Defina o seu número de WhatsApp (apenas números, com DDD)
    const meuNumero = "5511999999999"; 

    // 2. Montar o cabeçalho da mensagem
    let mensagem = `*Novo Pedido - Oliva*%0A`;
    mensagem += `----------------------------%0A`;

    // 3. Listar os itens do carrinho
    carrinho.forEach(item => {
        const subtotalItem = (item.preco * item.qty).toFixed(2).replace('.', ',');
        mensagem += `*${item.qty}x* ${item.nome}%0A`;
        mensagem += `Subtotal: R$ ${subtotalItem}%0A%0A`;
    });

    // 4. Calcular e adicionar o total
    const totalGeral = carrinho.reduce((sum, item) => sum + (item.preco * item.qty), 0);
    mensagem += `----------------------------%0A`;
    mensagem += `*Total do Pedido: R$ ${totalGeral.toFixed(2).replace('.', ',')}*%0A`;
    mensagem += `----------------------------%0A`;
    mensagem += `%0A_Por favor, informe o endereço de entrega._`;

    // 5. Criar o link e redirecionar
    const linkWhatsApp = `https://wa.me/${meuNumero}?text=${mensagem}`;
    
    // Opcional: Limpar o carrinho após enviar o pedido
    // localStorage.removeItem('oliva_cart');
    
    window.open(linkWhatsApp, '_blank');
}

renderCart();