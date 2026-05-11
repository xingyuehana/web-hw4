import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// 在 ES Module 中模擬 __dirname 的寫法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 連線 SQLite 資料庫 (將 db 檔案建在專案根目錄，方便 Azure 部署)
const dbPath = path.join(__dirname, '../data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('資料庫連線失敗:', err.message);
    else console.log('成功連線到 SQLite 資料庫！');
});

// 2. 建立資料表 (如果不存在的話，就建一個 prices 資料表)
db.run(`CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    name TEXT,
    price INTEGER
)`);

// 3. API 路由 - 取得所有泡麵物價紀錄 (GET)
router.get('/api/prices', (req, res) => {
    db.all("SELECT * FROM prices ORDER BY date DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // 將資料轉成 JSON 格式傳給前端
    });
});

// 4. API 路由 - 新增一筆泡麵物價紀錄 (POST)
router.post('/api/prices', (req, res) => {
    const { date, name, price } = req.body;
    const sql = "INSERT INTO prices (date, name, price) VALUES (?, ?, ?)";
    
    db.run(sql, [date, name, price], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, date, name, price }); // 回傳新增成功的資料
    });
});

export default router;