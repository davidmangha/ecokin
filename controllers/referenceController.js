const Commune = require('../models/Commune');

async function listCommunes(req, res, next) {
  try {
    const communes = await Commune.all();
    res.json({ communes });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCommunes
};
