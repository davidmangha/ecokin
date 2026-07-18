const jwt = require('jsonwebtoken');
const User = require('../../models/User');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentification requise.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findById(payload.id);

    if (!user || user.statut !== 'actif') {
      return res.status(401).json({ message: 'Compte introuvable ou inactif.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session invalide ou expiree.' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acces reserve aux administrateurs.' });
  }

  next();
}

module.exports = {
  protect,
  adminOnly
};
