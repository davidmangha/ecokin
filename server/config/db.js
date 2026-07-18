const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

function sslConfig() {
  const enabled = ['1', 'true', 'required'].includes(String(process.env.DB_SSL || '').toLowerCase());

  if (!enabled) {
    return undefined;
  }

  const config = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };

  if (process.env.DB_SSL_CA_PATH) {
    config.ca = fs.readFileSync(path.resolve(process.env.DB_SSL_CA_PATH), 'utf8');
  }

  return config;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecokin',
  ssl: sslConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
