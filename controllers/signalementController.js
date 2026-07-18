const Signalement = require('../models/Signalement');
const Photo = require('../models/Photo');

async function listSignalements(req, res, next) {
  try {
    const signalements = await Signalement.list({
      statut: req.query.statut,
      commune_id: req.query.commune_id
    });

    res.json({ signalements });
  } catch (error) {
    next(error);
  }
}

async function getSignalement(req, res, next) {
  try {
    const signalement = await Signalement.findById(req.params.id);

    if (!signalement) {
      return res.status(404).json({ message: 'Signalement introuvable.' });
    }

    res.json({ signalement });
  } catch (error) {
    next(error);
  }
}

async function createSignalement(req, res, next) {
  try {
    const {
      titre,
      description,
      type_dechet,
      commune_id,
      adresse,
      latitude,
      longitude,
      niveau_urgence
    } = req.body;

    if (!titre || !description || !type_dechet || !latitude || !longitude) {
      return res.status(400).json({
        message: 'Titre, description, type de dechet et position GPS sont requis.'
      });
    }

    const signalement = await Signalement.create({
      utilisateur_id: req.user.id,
      titre,
      description,
      type_dechet,
      commune_id,
      adresse,
      latitude: Number(latitude),
      longitude: Number(longitude),
      niveau_urgence
    });

    if (req.file) {
      await Photo.create({
        signalement_id: signalement.id,
        url_photo: `/uploads/${req.file.filename}`,
        nom_fichier: req.file.originalname
      });
    }

    const created = await Signalement.findById(signalement.id);
    res.status(201).json({ message: 'Signalement envoye.', signalement: created });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { statut } = req.body;
    const statuts = ['nouveau', 'en_cours', 'resolu', 'rejete'];

    if (!statuts.includes(statut)) {
      return res.status(400).json({ message: 'Statut de signalement invalide.' });
    }

    const signalement = await Signalement.updateStatus(req.params.id, statut);
    res.json({ message: 'Statut mis a jour.', signalement });
  } catch (error) {
    next(error);
  }
}

async function removeSignalement(req, res, next) {
  try {
    await Signalement.remove(req.params.id);
    res.json({ message: 'Signalement supprime.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listSignalements,
  getSignalement,
  createSignalement,
  updateStatus,
  removeSignalement
};
