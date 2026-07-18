const Signalement = require('../models/Signalement');
const User = require('../models/User');
const Collecteur = require('../models/Collecteur');

async function stats(req, res, next) {
  try {
    const [signalements, users, collecteurs] = await Promise.all([
      Signalement.stats(),
      User.list(),
      Collecteur.list()
    ]);

    res.json({
      stats: {
        ...signalements,
        utilisateurs: users.length,
        collecteurs: collecteurs.length
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  stats
};
