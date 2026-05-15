// =====================================================
// db.js — Conexión MySQL (pool de conexiones)
// =====================================================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'restaurante_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Verificar conexión al arrancar
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL →', process.env.DB_NAME || 'restaurante_db');
    conn.release();
  })
  .catch(e => console.error('❌ Error de conexión MySQL:', e.message));

module.exports = pool;