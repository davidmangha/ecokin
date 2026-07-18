const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ressource introuvable.' });
});

app.use((error, req, res, next) => {
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
