const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Em Vercel não é permitido gravar no diretório da função; use /tmp (ephemeral)
const dbFile = process.env.VERCEL ? '/tmp/oliva.sqlite' : path.join(__dirname, '../../oliva.sqlite');

// Abre/Cria o arquivo físico do banco de dados
const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco:', err);
        // sem throw para não travar a função, mas responda erro em endpoints
    }
});

// Cria a tabela se ela não existir
db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    categoria TEXT,
    desc TEXT,
    preco REAL,
    img TEXT
)`);

// Rota para LISTAR produtos
app.get('/api/produtos', (req, res) => {
    db.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

// Rota para ADICIONAR produto
app.post('/api/produtos', (req, res) => {
    const { nome, categoria, desc, preco, img } = req.body;
    const sql = "INSERT INTO produtos (nome, categoria, desc, preco, img) VALUES (?,?,?,?,?)";
    db.run(sql, [nome, categoria, desc, preco, img], function(err) {
        if (err) return res.status(500).json(err);
        res.json({ id: this.lastID });
    });
});

// Rota para REMOVER produto
app.delete('/api/produtos/:id', (req, res) => {
    db.run("DELETE FROM produtos WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Removido" });
    });
});

if (process.env.VERCEL) {
    // Vercel executa como função serverless, não chame listen
    module.exports = app;
} else {
    app.listen(3000, () => console.log("Servidor Oliva rodando em http://localhost:3000"));
}