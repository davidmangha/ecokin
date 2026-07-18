const pool = require('../server/config/db');

class Intervention {
  static async create({ signalement_id, collecteur_id, planifiee_le, commentaire }) {
    const [result] = await pool.query(
      `INSERT INTO interventions (signalement_id, collecteur_id, planifiee_le, commentaire)
       VALUES (?, ?, ?, ?)`,
      [signalement_id, collecteur_id, planifiee_le || null, commentaire || null]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT i.*, co.nom_structure, s.titre AS signalement_titre
       FROM interventions i
       JOIN collecteurs co ON co.id = i.collecteur_id
       JOIN signalements s ON s.id = i.signalement_id
       WHERE i.id = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  }

  static async list() {
    const [rows] = await pool.query(
      `SELECT i.*, co.nom_structure, s.titre AS signalement_titre
       FROM interventions i
       JOIN collecteurs co ON co.id = i.collecteur_id
       JOIN signalements s ON s.id = i.signalement_id
       ORDER BY i.created_at DESC`
    );

    return rows;
  }
}

module.exports = Intervention;
