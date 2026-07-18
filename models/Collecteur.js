const pool = require('../server/config/db');

class Collecteur {
  static async list() {
    const [rows] = await pool.query(
      `SELECT co.*, u.nom AS responsable_nom, c.nom AS commune_nom
       FROM collecteurs co
       LEFT JOIN utilisateurs u ON u.id = co.utilisateur_id
       LEFT JOIN communes c ON c.id = co.commune_id
       ORDER BY co.nom_structure ASC`
    );

    return rows;
  }
}

module.exports = Collecteur;
