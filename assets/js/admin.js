const API_URL = "/api/produtos";
let editModeId = null; // Controla se estamos criando ou editando

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
                    <button class="btn-edit" onclick="prepareEdit(${JSON.stringify(p).replace(/"/g, '&quot;')})" style="background:#f39c12; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; margin-right:5px;">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || "<tr><td colspan='4' style='text-align:center;'>Nenhum produto cadastrado.</td></tr>";
    } catch (e) { console.error(e); }
}

// Função que preenche o formulário para editar
function prepareEdit(produto) {
    editModeId = produto.id;
    
    document.getElementById('adm-nome').value = produto.nome;
    document.getElementById('adm-cat').value = produto.categoria;
    document.getElementById('adm-preco').value = produto.preco;
    document.getElementById('adm-img').value = produto.img;
    document.getElementById('adm-desc').value = produto.desc;

    // Altera o visual do formulário para indicar edição
    const btnSave = document.querySelector('.btn-save');
    btnSave.innerHTML = `Atualizar Produto <i class="fa-solid fa-arrows-rotate"></i>`;
    btnSave.style.background = "#f39c12";
    
    // Rola para o topo para facilitar a visualização
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Se editModeId tiver valor, usa PUT, senão usa POST
    const method = editModeId ? 'PUT' : 'POST';
    const url = editModeId ? `${API_URL}/${editModeId}` : API_URL;

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
    });

    if (response.ok) {
        alert(editModeId ? "Produto atualizado!" : "Produto salvo!");
        location.reload();
    } else {
        alert("Erro ao salvar.");
    }
}

async function deleteProduct(id) {
    if (!confirm("Excluir este produto?")) return;
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if(response.ok) location.reload();
}

window.onload = renderAdminList;