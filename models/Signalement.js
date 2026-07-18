const pool = require('../server/config/db');
const Photo = require('./Photo');

class Signalement {
  static async create(data) {
    const [result] = await pool.query(
      `INSERT INTO signalements
        (utilisateur_id, commune_id, titre, description, type_dechet, adresse, latitude, longitude, niveau_urgence)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.utilisateur_id,
        data.commune_id || null,
        data.titre,
        data.description,
        data.type_dechet,
        data.adresse || null,
        data.latitude,
        data.longitude,
        data.niveau_urgence || 'moyen'
      ]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT s.*, u.nom AS utilisateur_nom, c.nom AS commune_nom
       FROM signalements s
       JOIN utilisateurs u ON u.id = s.utilisateur_id
       LEFT JOIN communes c ON c.id = s.commune_id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    );

    const signalement = rows[0] || null;
    if (!signalement) return null;

    signalement.photos = await Photo.findBySignalement(id);
    return signalement;
  }

  static async list(filters = {}) {
    const params = [];
    const clauses = [];

    if (filters.statut) {
      clauses.push('s.statut = ?');
      params.push(filters.statut);
    }

    if (filters.commune_id) {
      clauses.push('s.commune_id = ?');
      params.push(filters.commune_id);
    }

    if (filters.utilisateur_id) {
      clauses.push('s.utilisateur_id = ?');
      params.push(filters.utilisateur_id);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT s.*, u.nom AS utilisateur_nom, c.nom AS commune_nom,
              p.url_photo AS photo_url
       FROM signalements s
       JOIN utilisateurs u ON u.id = s.utilisateur_id
       LEFT JOIN communes c ON c.id = s.commune_id
       LEFT JOIN (
         SELECT signalement_id, MIN(url_photo) AS url_photo
         FROM photos
         GROUP BY signalement_id
       ) p ON p.signalement_id = s.id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT 200`,
      params
    );

    return rows;
  }

  static async listByUser(userId) {
    return this.list({ utilisateur_id: userId });
  }

  static async updateStatus(id, statut) {
    await pool.query('UPDATE signalements SET statut = ? WHERE id = ?', [statut, id]);
    return this.findById(id);
  }

  static async remove(id) {
    await pool.query('DELETE FROM signalements WHERE id = ?', [id]);
  }

  static async stats() {
    const [[totals]] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(statut = 'nouveau') AS nouveaux,
         SUM(statut = 'en_cours') AS en_cours,
         SUM(statut = 'resolu') AS resolus
       FROM signalements`
    );

    const [byType] = await pool.query(
      `SELECT type_dechet, COUNT(*) AS total
       FROM signalements
       GROUP BY type_dechet
       ORDER BY total DESC`
    );

    const [byCommune] = await pool.query(
      `SELECT c.nom AS commune, COUNT(s.id) AS total
       FROM communes c
       LEFT JOIN signalements s ON s.commune_id = c.id
       GROUP BY c.id, c.nom
       ORDER BY total DESC, c.nom ASC
       LIMIT 10`
    );

    const recent = await this.list();

    return {
      totals,
      byType,
      byCommune,
      recent: recent.slice(0, 8)
    };
  }
}

module.exports = Signalement;
