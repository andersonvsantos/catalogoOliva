const API_URL = "/api/produtos";

// --- FUNÇÕES DE LÓGICA ---

function obterSenha() {
    return sessionStorage.getItem('oliva_admin_pass');
}

async function verificarSenhaManual() {
    const senhaDigitada = document.getElementById('senha-admin-input').value;
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha: senhaDigitada })
        });

        if (response.ok) {
            sessionStorage.setItem('oliva_admin_pass', 'logado'); 
            location.reload(); 
        } else {
            alert("Senha incorreta!");
        }
    } catch (e) {
        alert("Erro ao conectar para validar senha.");
    }
}

async function renderAdminList() {
    const logado = obterSenha();
    const overlay = document.getElementById('admin-login-overlay');
    
    if (!logado) {
        if(overlay) overlay.style.display = 'flex';
        return;
    }
    if(overlay) overlay.style.display = 'none';

    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        const list = document.getElementById('admin-list');

        list.innerHTML = produtos.map(p => `
            <tr>
                <td data-label="Imagem"><img src="${p.img}" alt="${p.nome}" class="img-thumb"></td>
                <td data-label="Produto"><strong>${p.nome}</strong></td>
                <td data-label="Preço">R$ ${p.preco.toFixed(2)}</td>
                <td data-label="Ação">
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `).join('') || "<tr><td colspan='4' style='text-align:center;'>Nenhum produto cadastrado.</td></tr>";
    } catch (e) { console.error(e); }
}

async function handleSave() {
    const produto = {
        nome: document.getElementById('adm-nome').value,
        categoria: document.getElementById('adm-cat').value || "Geral",
        preco: parseFloat(document.getElementById('adm-preco').value),
        img: document.getElementById('adm-img').value,
        desc: document.getElementById('adm-desc').value || ""
    };

    if(!produto.nome || !produto.preco) return alert("Preencha os campos obrigatórios!");

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
    if (!confirm("Excluir este produto?")) return;
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if(response.ok) location.reload();
}

window.onload = renderAdminList;