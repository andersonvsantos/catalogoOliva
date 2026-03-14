// URL adaptada para rodar tanto local quanto na Vercel
const API_URL = "http://localhost:3000/api/produtos";

/**
 * Pede a senha via prompt e armazena na sessão do navegador.
 * Se o usuário cancelar, ele é redirecionado para a loja.
 */
async function obterSenha() {
    let senha = sessionStorage.getItem('oliva_admin_pass');
    
    if (senha && senha !== "null" && senha.trim() !== "") {
        // Se já tem senha, esconde a tela de login
        document.getElementById('admin-login-overlay').style.display = 'none';
        return senha;
    }
    
    // Se não tem senha, garante que a tela de login esteja visível
    document.getElementById('admin-login-overlay').style.display = 'flex';
    return null;
}

// Nova função para o botão "Entrar"
async function verificarSenhaManual() {
    const input = document.getElementById('senha-admin-input');
    const senha = input.value;

    if (senha && senha.trim() !== "") {
        sessionStorage.setItem('oliva_admin_pass', senha);
        const auth = await obterSenha();
        if (auth) renderAdminList();
    } else {
        alert("Por favor, digite uma senha.");
    }
}

// Inicializa verificando se já existe sessão ativa
window.onload = async () => {
    const auth = await obterSenha();
    if (auth) {
        renderAdminList();
    }
};

// 1. Função para carregar e exibir a lista de produtos na tabela
async function renderAdminList() {
    const list = document.getElementById('admin-list');
    
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();

        // O Turso retorna os dados em um formato levemente diferente as vezes, 
        // esta verificação garante que funcione sempre.
        if (!produtos || produtos.length === 0) {
            list.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:20px;'>Nenhum produto encontrado no banco de dados.</td></tr>";
            return;
        }

        list.innerHTML = produtos.map(p => `
            <tr>
                <td><img src="${p.img}" alt="${p.nome}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"></td>
                <td>
                    <strong>${p.nome}</strong><br>
                    <small style="color: #888;">${p.categoria}</small>
                </td>
                <td>R$ ${p.preco.toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})" style="color: #cc0000; background:none; border:none; cursor:pointer;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
        list.innerHTML = "<tr><td colspan='4' style='text-align:center; color:red;'>Erro ao carregar dados. Verifique sua conexão.</td></tr>";
    }
}

// 2. Função para salvar um novo produto no Turso
async function handleSave() {
    const senha = await obterSenha();
    if (!senha) return;

    const nome = document.getElementById('adm-nome').value;
    const cat = document.getElementById('adm-cat').value;
    const preco = document.getElementById('adm-preco').value;
    const img = document.getElementById('adm-img').value;
    const desc = document.getElementById('adm-desc').value;

    if (!nome || !preco || !img) {
        alert("Por favor, preencha Nome, Preço e Imagem!");
        return;
    }

    const novoProduto = {
        nome: nome,
        categoria: cat || "Geral",
        desc: desc || "",
        preco: parseFloat(preco),
        img: img
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': senha 
            },
            body: JSON.stringify(novoProduto)
        });

        if (response.status === 401) {
            alert("⚠️ Senha incorreta! Acesso negado.");
            sessionStorage.removeItem('oliva_admin_pass');
            location.reload(); 
            return;
        }

        if (response.ok) {
            alert("✅ Produto salvo com sucesso na nuvem!");
            limparFormulario();
            renderAdminList();
        }
    } catch (error) {
        alert("Erro ao salvar. Verifique se o servidor está rodando.");
    }
}

// 3. Função para remover um produto do Turso
async function deleteProduct(id) {
    const senha = await obterSenha();
    if (!senha || !confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': senha 
            }
        });

        if (response.status === 401) {
            alert("⚠️ Senha incorreta!");
            sessionStorage.removeItem('oliva_admin_pass');
            location.reload();
            return;
        }

        if (response.ok) {
            renderAdminList();
        }
    } catch (error) {
        alert("Erro ao deletar o produto.");
    }
}

// 4. Auxiliar: Limpa os campos do formulário
function limparFormulario() {
    document.getElementById('adm-nome').value = "";
    document.getElementById('adm-cat').value = "";
    document.getElementById('adm-preco').value = "";
    document.getElementById('adm-img').value = "";
    document.getElementById('adm-desc').value = "";
}

// Inicializa: Garante que a senha seja pedida antes de listar
window.onload = async () => {
    console.log("Página carregada, pedindo senha..."); // Para você ver no console (F12)
    const auth = await obterSenha();
    if (auth) {
        renderAdminList();
    }
};