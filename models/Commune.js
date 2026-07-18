const pool = require('../server/config/db');

class Commune {
  static async all() {
    const [rows] = await pool.query(
      `SELECT id, nom, district, latitude, longitude
       FROM communes
       ORDER BY nom ASC`
    );

    return rows;
  }
}

module.exports = Commune;
