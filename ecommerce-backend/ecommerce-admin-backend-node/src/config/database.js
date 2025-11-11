const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

const shouldSkipDb = String(process.env.SKIP_DB || '').trim() === '1';

const testConnection = async () => {
  if (shouldSkipDb) {
    console.warn('⚠️  SKIP_DB=1 — bỏ qua kiểm tra kết nối DB (chỉ nên dùng dev)');
    return;
  }
  try {
    const conn = await pool.getConnection();
    console.log('✅ Admin DB connected', { host: dbConfig.host, db: dbConfig.database });
    conn.release();
  } catch (err) {
    console.error('❌ Admin DB connect failed:', err.message, { host: dbConfig.host, db: dbConfig.database });
    process.exit(1);
  }
};

module.exports = { pool, testConnection, shouldSkipDb };


