const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const signalementRoutes = require('../routes/signalementRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');
const educationRoutes = require('../routes/educationRoutes');
const adminRoutes = require('../routes/adminRoutes');
const referenceRoutes = require('../routes/referenceRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'client')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/signalements', signalementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', referenceRoutes);

app.get('/api/health', async (req, res) => {
  const env = {
    DB_HOST: Boolean(process.env.DB_HOST),
    DB_PORT: Boolean(process.env.DB_PORT),
    DB_USER: Boolean(process.env.DB_USER),
    DB_PASSWORD: Boolean(process.env.DB_PASSWORD),
    DB_NAME: Boolean(process.env.DB_NAME),
    DB_SSL: process.env.DB_SSL || null,
    NODE_ENV: process.env.NODE_ENV || null
  };

  try {
    await pool.query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      database: 'connected',
      env
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'unavailable',
      error: {
        code: error.code,
        message: error.message
      },
      env
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ressource introuvable.' });
});

app.use((error, req, res, next) => {
  console.error('EcoKin server error:', {
    method: req.method,
    url: req.originalUrl,
    code: error.code,
    message: error.message,
    stack: error.stack
  });

  const status = error.status || 500;
  res.status(status).json({
    message: error.message || 'Erreur serveur.'
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`EcoKin fonctionne sur http://localhost:${port}`);
  });
}

module.exports = app;
