const Education = require('../models/Education');
const Campagne = require('../models/Campagne');

async function listContents(req, res, next) {
  try {
    const contenus = await Education.listPublished();
    res.json({ contenus });
  } catch (error) {
    next(error);
  }
}

async function listCampaigns(req, res, next) {
  try {
    const campagnes = await Campagne.listActive();
    res.json({ campagnes });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listContents,
  listCampaigns
};
