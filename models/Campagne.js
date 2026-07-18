const pool = require('../server/config/db');

class Campagne {
  static async listActive() {
    const [rows] = await pool.query(
      `SELECT ca.*, c.nom AS commune_nom
       FROM campagnes ca
       LEFT JOIN communes c ON c.id = ca.commune_id
       WHERE ca.statut IN ('planifiee', 'active')
       ORDER BY ca.date_debut ASC`
    );

    return rows;
  }
}

module.exports = Campagne;
