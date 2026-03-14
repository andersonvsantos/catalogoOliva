const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Rota para buscar produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM produtos");
        res.json(result.rows);
    } catch (error) {
        res.json([]);
    }
});

// Rota para salvar produtos - SEM VALIDAÇÃO DE SENHA
app.post('/api/produtos', async (req, res) => {
    const { nome, categoria, desc, preco, img } = req.body;

    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                categoria TEXT,
                desc TEXT,
                preco REAL,
                img TEXT
            )
        `);

        await db.execute({
            sql: "INSERT INTO produtos (nome, categoria, desc, preco, img) VALUES (?, ?, ?, ?, ?)",
            args: [nome, categoria, desc, preco, img]
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar' });
    }
});

// Rota para deletar - SEM VALIDAÇÃO DE SENHA
app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute({
            sql: "DELETE FROM produtos WHERE id = ?",
            args: [id]
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar' });
    }
});

// Rota para validar login (Frontend -> Backend)
app.post('/api/login', (req, res) => {
    const { senha } = req.body;
    const senhaMestra = process.env.password;

    if (senha && senha.trim() === senhaMestra.trim()) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// Mantenha as outras rotas (GET, POST, DELETE) SEM a trava de senha, 
// como combinamos, para evitar erros de cabeçalho.

module.exports = app;