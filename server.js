const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// データベーステーブル初期化
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poster_states (
        id SERIAL PRIMARY KEY,
        city VARCHAR(10) NOT NULL,
        district_id VARCHAR(10) NOT NULL,
        location_id VARCHAR(10),
        is_checked BOOLEAN DEFAULT FALSE,
        memo TEXT DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(city, district_id, location_id)
      )
    `);
    console.log('データベーステーブルが初期化されました');
  } catch (err) {
    console.error('データベース初期化エラー:', err);
  }
};

initDatabase();

// API Routes

// 全ての状態を取得
app.get('/api/states/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const result = await pool.query(
      'SELECT * FROM poster_states WHERE city = $1',
      [city]
    );
    
    const checkStates = {};
    const memos = {};
    
    result.rows.forEach(row => {
      const key = row.location_id ? `${row.district_id}-${row.location_id}` : `${row.district_id}-district`;
      checkStates[key] = row.is_checked;
      if (row.memo) {
        memos[key] = row.memo;
      }
    });
    
    res.json({ checkStates, memos });
  } catch (err) {
    console.error('状態取得エラー:', err);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

// チェック状態を更新
app.post('/api/states/check', async (req, res) => {
  try {
    const { city, districtId, locationId, isChecked } = req.body;
    
    await pool.query(`
      INSERT INTO poster_states (city, district_id, location_id, is_checked, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (city, district_id, location_id)
      DO UPDATE SET 
        is_checked = $4,
        updated_at = CURRENT_TIMESTAMP
    `, [city, districtId, locationId || null, isChecked]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('チェック状態更新エラー:', err);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

// メモを更新
app.post('/api/states/memo', async (req, res) => {
  try {
    const { city, districtId, locationId, memo } = req.body;
    
    await pool.query(`
      INSERT INTO poster_states (city, district_id, location_id, memo, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (city, district_id, location_id)
      DO UPDATE SET 
        memo = $4,
        updated_at = CURRENT_TIMESTAMP
    `, [city, districtId, locationId || null, memo]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('メモ更新エラー:', err);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

// 統計情報を取得
app.get('/api/stats/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const result = await pool.query(`
      SELECT 
        district_id,
        COUNT(*) as total_locations,
        COUNT(CASE WHEN is_checked = true AND location_id IS NOT NULL THEN 1 END) as completed_locations
      FROM poster_states 
      WHERE city = $1 AND location_id IS NOT NULL
      GROUP BY district_id
      ORDER BY district_id
    `, [city]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('統計取得エラー:', err);
    res.status(500).json({ error: 'データベースエラー' });
  }
});

// Reactアプリを提供
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`サーバーがポート${port}で起動しました`);
}); 