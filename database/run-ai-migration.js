const pool = require('../server/config/db');

const columns = [
  {
    name: 'article_sujet',
    sql: 'ALTER TABLE signalements ADD COLUMN article_sujet VARCHAR(160) NULL AFTER description'
  },
  {
    name: 'categorie_ia',
    sql: "ALTER TABLE signalements ADD COLUMN categorie_ia ENUM('dechet', 'erosion', 'mixte', 'inconnu') NULL DEFAULT 'inconnu' AFTER type_dechet"
  },
  {
    name: 'type_dechet_ia',
    sql: "ALTER TABLE signalements ADD COLUMN type_dechet_ia ENUM('plastique', 'organique', 'electronique', 'dangereux', 'encombrant', 'autre', 'inconnu') NULL DEFAULT 'inconnu' AFTER categorie_ia"
  },
  {
    name: 'erosion_detectee',
    sql: 'ALTER TABLE signalements ADD COLUMN erosion_detectee BOOLEAN NOT NULL DEFAULT FALSE AFTER type_dechet_ia'
  },
  {
    name: 'confiance_ia',
    sql: 'ALTER TABLE signalements ADD COLUMN confiance_ia DECIMAL(5, 2) NULL AFTER erosion_detectee'
  },
  {
    name: 'resume_ia',
    sql: 'ALTER TABLE signalements ADD COLUMN resume_ia VARCHAR(255) NULL AFTER confiance_ia'
  },
  {
    name: 'articles_sujet',
    sql: 'ALTER TABLE signalements ADD COLUMN articles_sujet JSON NULL AFTER resume_ia'
  },
  {
    name: 'analyse_ia',
    sql: 'ALTER TABLE signalements ADD COLUMN analyse_ia JSON NULL AFTER articles_sujet'
  }
];

const indexes = [
  {
    name: 'idx_signalements_categorie_ia',
    sql: 'ALTER TABLE signalements ADD INDEX idx_signalements_categorie_ia (categorie_ia)'
  },
  {
    name: 'idx_signalements_erosion',
    sql: 'ALTER TABLE signalements ADD INDEX idx_signalements_erosion (erosion_detectee)'
  }
];

const contents = [
  {
    titre: 'Comprendre l erosion urbaine',
    slug: 'comprendre-erosion-urbaine',
    categorie: 'Erosion',
    resume: 'Identifier les ravines, sols nus et zones fragilisees par le ruissellement.',
    contenu:
      'Une erosion visible doit etre documentee avec photo, position GPS et description du terrain. Les caniveaux bouches et les sols denudes aggravent rapidement le risque.'
  },
  {
    titre: 'Proteger les pentes et caniveaux',
    slug: 'proteger-pentes-caniveaux',
    categorie: 'Prevention',
    resume: 'Limiter le ruissellement et surveiller les zones sensibles apres de fortes pluies.',
    contenu:
      'La vegetation, le curage des caniveaux et la protection des pentes reduisent les degats. Signalez les fissures, ravines et affaissements des leur apparition.'
  },
  {
    titre: 'Dechets electroniques',
    slug: 'dechets-electroniques',
    categorie: 'Tri',
    resume: 'Mettre a part piles, batteries, cables et petits appareils.',
    contenu:
      'Les composants electroniques peuvent contenir des metaux et produits toxiques. Evitez de les melanger aux ordures courantes et signalez les depots importants.'
  },
  {
    titre: 'Dechets dangereux',
    slug: 'dechets-dangereux',
    categorie: 'Sante',
    resume: 'Reconnaitre les huiles, produits chimiques, batteries et objets a risque.',
    contenu:
      'Ne touchez pas directement les dechets dangereux. Gardez une distance, ajoutez une photo claire et priorisez le signalement pour une intervention adaptee.'
  },
  {
    titre: 'Objets encombrants',
    slug: 'objets-encombrants',
    categorie: 'Collecte',
    resume: 'Organiser le retrait des gros volumes sans bloquer la route ou les caniveaux.',
    contenu:
      'Les meubles, gravats et gros objets doivent etre regroupes proprement et signales avec precision afin de faciliter la collecte specialisee.'
  }
];

async function columnExists(name) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'signalements'
       AND COLUMN_NAME = ?`,
    [name]
  );
  return Number(row.total) > 0;
}

async function indexExists(name) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'signalements'
       AND INDEX_NAME = ?`,
    [name]
  );
  return Number(row.total) > 0;
}

async function seedContent(item) {
  await pool.query(
    `INSERT INTO contenus_educatifs (titre, slug, categorie, resume, contenu)
     SELECT ?, ?, ?, ?, ?
     WHERE NOT EXISTS (
       SELECT 1 FROM contenus_educatifs WHERE slug = ?
     )`,
    [item.titre, item.slug, item.categorie, item.resume, item.contenu, item.slug]
  );
}

async function run() {
  for (const column of columns) {
    if (!(await columnExists(column.name))) {
      await pool.query(column.sql);
      console.log(`Colonne ajoutee: ${column.name}`);
    }
  }

  for (const index of indexes) {
    if (!(await indexExists(index.name))) {
      await pool.query(index.sql);
      console.log(`Index ajoute: ${index.name}`);
    }
  }

  for (const item of contents) {
    await seedContent(item);
  }

  console.log('Migration IA terminee.');
}

run()
  .catch((error) => {
    console.error(`Migration IA impossible: ${error.code || error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
