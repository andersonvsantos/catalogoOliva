const API_URL = "/api/produtos";

function obterSenha() {
    return sessionStorage.getItem('oliva_admin_pass');
}

// ESTA FUNÇÃO AGORA VALIDA COM O .ENV
async function verificarSenhaManual() {
    const senhaDigitada = document.getElementById('senha-admin-input').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha: senhaDigitada })
        });

        if (response.ok) {
            // Se o servidor disse que a senha do .env bate:
            sessionStorage.setItem('oliva_admin_pass', 'logado'); 
            location.reload(); 
        } else {
            alert("Senha incorreta de acordo com o servidor!");
        }
    } catch (e) {
        alert("Erro ao conectar para validar senha.");
    }
}

async function renderAdminList() {
    const logado = obterSenha();
    const overlay = document.getElementById('admin-login-overlay');
    
    if (!logado) {
        overlay.style.display = 'flex';
        return;
    }
    overlay.style.display = 'none';

    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        const list = document.getElementById('admin-list');

        list.innerHTML = produtos.map(p => `
            <tr>
                <td data-label="Imagem"><img src="${p.img}" alt="${p.nome}"></td>
                <td data-label="Produto"><strong>${p.nome}</strong></td>
                <td data-label="Preço">R$ ${p.preco.toFixed(2)}</td>
                <td data-label="Ação">
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

// Funções handleSave e deleteProduct continuam IGUAIS (sem pedir senha no fetch)
async function handleSave() {
    const produto = {
        nome: document.getElementById('adm-nome').value,
        categoria: document.getElementById('adm-cat').value || "Geral",
        preco: parseFloat(document.getElementById('adm-preco').value),
        img: document.getElementById('adm-img').value,
        desc: document.getElementById('adm-desc').value || ""
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
    });

    if (response.ok) {
        alert("Produto salvo!");
        location.reload();
    }
}

async function deleteProduct(id) {
    if (!confirm("Excluir?")) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    location.reload();
}

window.onload = renderAdminList;