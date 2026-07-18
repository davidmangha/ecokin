const pool = require('../server/config/db');

function publicUser(row) {
  if (!row) return null;
  const { mot_de_passe, ...user } = row;
  return user;
}

class User {
  static async create({ nom, email, telephone, mot_de_passe, commune_id = null, role = 'citoyen' }) {
    const [result] = await pool.query(
      `INSERT INTO utilisateurs (nom, email, telephone, mot_de_passe, commune_id, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, email, telephone || null, mot_de_passe, commune_id || null, role]
    );

    return this.findById(result.insertId);
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT u.*, c.nom AS commune_nom
       FROM utilisateurs u
       LEFT JOIN communes c ON c.id = u.commune_id
       WHERE u.id = ?
       LIMIT 1`,
      [id]
    );

    return publicUser(rows[0]);
  }

  static async list() {
    const [rows] = await pool.query(
      `SELECT u.id, u.nom, u.email, u.telephone, u.role, u.statut, u.created_at,
              c.nom AS commune_nom
       FROM utilisateurs u
       LEFT JOIN communes c ON c.id = u.commune_id
       ORDER BY u.created_at DESC`
    );

    return rows;
  }

  static async updateProfile(id, { nom, telephone, commune_id }) {
    await pool.query(
      `UPDATE utilisateurs
       SET nom = ?, telephone = ?, commune_id = ?
       WHERE id = ?`,
      [nom, telephone || null, commune_id || null, id]
    );

    return this.findById(id);
  }

  static async updateRole(id, role) {
    await pool.query('UPDATE utilisateurs SET role = ? WHERE id = ?', [role, id]);
    return this.findById(id);
  }

  static async updateStatus(id, statut) {
    await pool.query('UPDATE utilisateurs SET statut = ? WHERE id = ?', [statut, id]);
    return this.findById(id);
  }
}

module.exports = User;
