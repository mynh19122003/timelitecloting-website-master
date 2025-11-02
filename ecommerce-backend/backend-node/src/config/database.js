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

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully', { host: dbConfig.host, db: dbConfig.database });
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message, { host: dbConfig.host, db: dbConfig.database });
    process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection
};
