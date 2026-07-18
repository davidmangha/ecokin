const User = require('../models/User');

async function getProfile(req, res) {
  res.json({ user: req.user });
}

async function updateProfile(req, res, next) {
  try {
    const { nom, telephone, commune_id } = req.body;

    if (!nom) {
      return res.status(400).json({ message: 'Le nom est requis.' });
    }

    const user = await User.updateProfile(req.user.id, {
      nom,
      telephone,
      commune_id
    });

    res.json({ message: 'Profil mis a jour.', user });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.list();
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const roles = ['citoyen', 'collecteur', 'admin'];

    if (!roles.includes(role)) {
      return res.status(400).json({ message: 'Role invalide.' });
    }

    const user = await User.updateRole(req.params.id, role);
    res.json({ message: 'Role mis a jour.', user });
  } catch (error) {
    next(error);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { statut } = req.body;
    const statuts = ['actif', 'suspendu'];

    if (!statuts.includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    const user = await User.updateStatus(req.params.id, statut);
    res.json({ message: 'Statut mis a jour.', user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  listUsers,
  updateUserRole,
  updateUserStatus
};
