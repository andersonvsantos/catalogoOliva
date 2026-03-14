const API_URL = "/api/produtos";

// Pega a senha salva ou mostra o login
async function obterSenha() {
    let senha = sessionStorage.getItem('oliva_admin_pass');
    const overlay = document.getElementById('admin-login-overlay');
    
    if (senha) {
        overlay.style.display = 'none';
        return senha;
    }
    
    overlay.style.display = 'flex';
    return null;
}

// Acionado pelo botão "Entrar"
async function verificarSenhaManual() {
    const senha = document.getElementById('senha-admin-input').value;
    if (senha) {
        sessionStorage.setItem('oliva_admin_pass', senha);
        location.reload(); // Recarrega para validar e listar
    }
}

// 1. Carregar lista
async function renderAdminList() {
    const list = document.getElementById('admin-list');
    const senha = await obterSenha();
    if (!senha) return;

    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();

        if (!produtos || produtos.length === 0) {
            list.innerHTML = "<tr><td colspan='4' align='center'>Nenhum produto.</td></tr>";
            return;
        }

        list.innerHTML = produtos.map(p => `
            <tr>
                <td><img src="${p.img}" width="50"></td>
                <td><strong>${p.nome}</strong></td>
                <td>R$ ${p.preco}</td>
                <td><button onclick="deleteProduct(${p.id})">Excluir</button></td>
            </tr>
        `).join('');
    } catch (error) {
        list.innerHTML = "<tr><td colspan='4' align='center' style='color:red;'>Erro ao carregar.</td></tr>";
    }
}

// 2. Salvar
async function handleSave() {
    const senha = await obterSenha();
    const dados = {
        nome: document.getElementById('adm-nome').value,
        categoria: document.getElementById('adm-cat').value || "Geral",
        desc: document.getElementById('adm-desc').value || "",
        preco: parseFloat(document.getElementById('adm-preco').value),
        img: document.getElementById('adm-img').value
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': senha },
        body: JSON.stringify(dados)
    });

    if (response.status === 401) {
        alert("Senha Incorreta!");
        sessionStorage.removeItem('oliva_admin_pass');
        location.reload();
    } else if (response.ok) {
        alert("Salvo!");
        location.reload();
    }
}

// 3. Deletar
async function deleteProduct(id) {
    const senha = await obterSenha();
    if (!confirm("Excluir?")) return;

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': senha }
    });

    if (response.ok) renderAdminList();
}

window.onload = renderAdminList;