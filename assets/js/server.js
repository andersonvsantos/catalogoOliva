const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const useTurso = !!process.env.TURSO_DATABASE_URL;
let db;
let isTurso = false;

async function toJsonList(result) {
    if (!result) return [];
    const cols = result.columns || [];
    const values = result.values || [];
    return values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
}

async function initSqlite() {
    const dbFile = path.join(__dirname, '../../oliva.sqlite');
    db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
        if (err) console.error('[sqlite] Erro ao abrir o banco:', err);
    });

    db.run(`CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        categoria TEXT,
        desc TEXT,
        preco REAL,
        img TEXT
    )`, err => {
        if (err) console.error('[sqlite] Erro ao criar tabela:', err);
    });
}

async function initTurso() {
    db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        auth: { token: process.env.TURSO_AUTH_TOKEN },
    });
    isTurso = true;

    try {
        await db.execute(`CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            categoria TEXT,
            desc TEXT,
            preco REAL,
            img TEXT
        )`);
    } catch (error) {
        console.error('[turso] Erro ao criar tabela:', error);
    }
}

(async () => {
    if (useTurso) {
        console.log('Using Turso/LibSQL DB');
        await initTurso();
    } else {
        console.log('Using local sqlite DB');
        await initSqlite();
    }
})();

app.get('/api/produtos', async (req, res) => {
    try {
        if (isTurso) {
            const result = await db.execute('SELECT * FROM produtos');
            const rows = await toJsonList(result);
            return res.json(rows);
        }

        db.all('SELECT * FROM produtos', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    } catch (error) {
        console.error('GET /api/produtos error', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/produtos', async (req, res) => {
    if (req.headers.authorization !== process.env.password) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { nome, categoria, desc, preco, img } = req.body;

    if (!nome || !preco || !img) {
        return res.status(400).json({ error: 'Faltam campos obrigatórios' });
    }

    try {
        if (isTurso) {
            await db.execute('INSERT INTO produtos (nome, categoria, desc, preco, img) VALUES (?,?,?,?,?)', [nome, categoria, desc, preco, img]);
            const idResult = await db.execute('SELECT last_insert_rowid() as id');
            const idRow = await toJsonList(idResult);
            const id = idRow[0]?.id || null;
            return res.json({ id });
        }

        db.run('INSERT INTO produtos (nome, categoria, desc, preco, img) VALUES (?,?,?,?,?)', [nome, categoria, desc, preco, img], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
    } catch (error) {
        console.error('POST /api/produtos error', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/produtos/:id', async (req, res) => {
    if (req.headers.authorization !== process.env.password) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = req.params.id;

    try {
        if (isTurso) {
            await db.execute('DELETE FROM produtos WHERE id = ?', [id]);
            return res.json({ message: 'Removido' });
        }

        db.run('DELETE FROM produtos WHERE id = ?', [id], err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Removido' });
        });
    } catch (error) {
        console.error('DELETE /api/produtos/:id error', error);
        res.status(500).json({ error: error.message });
    }
});

if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(3000, () => console.log('Servidor Oliva rodando em http://localhost:3000'));
}