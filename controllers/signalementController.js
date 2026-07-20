const Signalement = require('../models/Signalement');
const Photo = require('../models/Photo');
const { analyzeIncidentPhoto } = require('../server/services/aiAnalysisService');

const wasteTypes = new Set(['plastique', 'organique', 'electronique', 'dangereux', 'encombrant', 'autre']);

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
      article_sujet,
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

    const aiAnalysis = await analyzeIncidentPhoto(req.file);
    const detectedWaste = aiAnalysis.type_dechet_ia;
    const finalWasteType =
      type_dechet === 'autre' && wasteTypes.has(detectedWaste) && detectedWaste !== 'inconnu'
        ? detectedWaste
        : type_dechet;

    const signalement = await Signalement.create({
      utilisateur_id: req.user.id,
      titre,
      description,
      article_sujet: article_sujet || aiAnalysis.article_sujet,
      type_dechet: finalWasteType,
      categorie_ia: aiAnalysis.categorie_ia,
      type_dechet_ia: aiAnalysis.type_dechet_ia,
      erosion_detectee: aiAnalysis.erosion_detectee,
      confiance_ia: aiAnalysis.confiance_ia,
      resume_ia: aiAnalysis.resume_ia,
      articles_sujet: aiAnalysis.articles_sujet,
      analyse_ia: aiAnalysis.analyse_ia,
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
