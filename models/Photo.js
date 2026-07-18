const pool = require('../server/config/db');

class Photo {
  static async create({ signalement_id, url_photo, nom_fichier }) {
    const [result] = await pool.query(
      `INSERT INTO photos (signalement_id, url_photo, nom_fichier)
       VALUES (?, ?, ?)`,
      [signalement_id, url_photo, nom_fichier]
    );

    return {
      id: result.insertId,
      signalement_id,
      url_photo,
      nom_fichier
    };
  }

  static async findBySignalement(signalementId) {
    const [rows] = await pool.query(
      `SELECT id, url_photo, nom_fichier, created_at
       FROM photos
       WHERE signalement_id = ?
       ORDER BY created_at DESC`,
      [signalementId]
    );

    return rows;
  }
}

module.exports = Photo;
