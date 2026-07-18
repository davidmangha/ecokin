const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET || 'dev_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
}

async function register(req, res, next) {
  try {
    const { nom, email, telephone, password, commune_id } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont requis.' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Cet email est deja utilise.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      nom,
      email,
      telephone,
      commune_id,
      mot_de_passe: hashedPassword
    });

    return res.status(201).json({
      message: 'Compte cree avec succes.',
      token: createToken(user),
      user
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
    }

    const userWithPassword = await User.findByEmail(email);
    if (!userWithPassword) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const passwordIsValid = await bcrypt.compare(password, userWithPassword.mot_de_passe);
    if (!passwordIsValid || userWithPassword.statut !== 'actif') {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const user = await User.findById(userWithPassword.id);

    return res.json({
      message: 'Connexion reussie.',
      token: createToken(user),
      user
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};
