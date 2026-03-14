const API_URL = "/api/produtos";

function obterSenha() {
    return sessionStorage.getItem('oliva_admin_pass');
}

async function verificarSenhaManual() {
    const senha = document.getElementById('senha-admin-input').value;
    if (senha) {
        sessionStorage.setItem('oliva_admin_pass', senha);
        location.reload(); 
    }
}

async function renderAdminList() {
    const senha = obterSenha();
    const overlay = document.getElementById('admin-login-overlay');
    
    if (!senha) {
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
                <td><img src="${p.img}" width="40"></td>
                <td>${p.nome}</td>
                <td>R$ ${p.preco}</td>
                <td><button onclick="deleteProduct(${p.id})">❌</button></td>
            </tr>
        `).join('') || "<tr><td colspan='4'>Nenhum produto.</td></tr>";
    } catch (e) { console.error(e); }
}

async function handleSave() {
    const senha = obterSenha();
    const produto = {
        nome: document.getElementById('adm-nome').value,
        categoria: document.getElementById('adm-cat').value || "Geral",
        preco: parseFloat(document.getElementById('adm-preco').value),
        img: document.getElementById('adm-img').value,
        desc: document.getElementById('adm-desc').value || ""
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': senha  // Envia a senha aqui
        },
        body: JSON.stringify(produto)
    });

    if (response.status === 401) {
        alert("Senha incorreta!");
        sessionStorage.removeItem('oliva_admin_pass');
        location.reload();
    } else if (response.ok) {
        alert("Produto salvo!");
        location.reload();
    }
}

async function deleteProduct(id) {
    const senha = obterSenha();
    if (!confirm("Excluir?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': senha }
    });
    location.reload();
}

window.onload = renderAdminList;