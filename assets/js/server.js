const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o Turso
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
        console.error("Erro no Banco:", error);
        // Se a tabela não existir, retorna vazio em vez de travar o servidor
        res.json([]);
    }
});

// Rota para salvar produtos
app.post('/api/produtos', async (req, res) => {
    const { nome, categoria, desc, preco, img } = req.body;
    const senha = req.headers['authorization'];

    if (senha !== process.env.PASSWORD) {
        return res.status(401).json({ error: 'Acesso negado' });
    }

    try {
        // Cria a tabela se ela não existir (Garante que não dê erro 500)
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
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar' });
    }
});

// Rota para deletar
app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const senha = req.headers['authorization'];

    if (senha !== process.env.PASSWORD) {
        return res.status(401).json({ error: 'Acesso negado' });
    }

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

// EXPORTAÇÃO OBRIGATÓRIA PARA VERCEL
module.exports = app;