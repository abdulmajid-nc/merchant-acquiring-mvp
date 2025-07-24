const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE merchants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    business_type TEXT,
    status TEXT DEFAULT 'Pending',
    docs TEXT
  )`);
});

app.post('/api/merchant/register', (req, res) => {
  const { name, email, business_type, docs } = req.body;
  db.run(
    `INSERT INTO merchants (name, email, business_type, docs) VALUES (?, ?, ?, ?)`,
    [name, email, business_type, docs],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, status: 'Pending' });
    }
  );
});

app.get('/api/merchants', (req, res) => {
  db.all(`SELECT * FROM merchants`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/merchant/:id', (req, res) => {
  db.get(`SELECT * FROM merchants WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Merchant not found" });
    res.json(row);
  });
});

app.put('/api/merchant/:id/status', (req, res) => {
  db.run(
    `UPDATE merchants SET status = ? WHERE id = ?`,
    [req.body.status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: true });
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
