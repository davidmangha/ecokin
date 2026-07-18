const pool = require('../server/config/db');

class Education {
  static async listPublished() {
    const [rows] = await pool.query(
      `SELECT ce.*, u.nom AS auteur_nom
       FROM contenus_educatifs ce
       LEFT JOIN utilisateurs u ON u.id = ce.auteur_id
       WHERE ce.publie = 1
       ORDER BY ce.created_at DESC`
    );

    return rows;
  }
}

module.exports = Education;
