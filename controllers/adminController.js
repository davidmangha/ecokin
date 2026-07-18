const Signalement = require('../models/Signalement');
const User = require('../models/User');
const Collecteur = require('../models/Collecteur');
const Intervention = require('../models/Intervention');

async function overview(req, res, next) {
  try {
    const [stats, users, collecteurs, interventions] = await Promise.all([
      Signalement.stats(),
      User.list(),
      Collecteur.list(),
      Intervention.list()
    ]);

    res.json({
      overview: {
        stats,
        users,
        collecteurs,
        interventions
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  overview
};
