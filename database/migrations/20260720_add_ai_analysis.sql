ALTER TABLE signalements
  ADD COLUMN article_sujet VARCHAR(160) NULL AFTER description,
  ADD COLUMN categorie_ia ENUM('dechet', 'erosion', 'mixte', 'inconnu') NULL DEFAULT 'inconnu' AFTER type_dechet,
  ADD COLUMN type_dechet_ia ENUM('plastique', 'organique', 'electronique', 'dangereux', 'encombrant', 'autre', 'inconnu') NULL DEFAULT 'inconnu' AFTER categorie_ia,
  ADD COLUMN erosion_detectee BOOLEAN NOT NULL DEFAULT FALSE AFTER type_dechet_ia,
  ADD COLUMN confiance_ia DECIMAL(5, 2) NULL AFTER erosion_detectee,
  ADD COLUMN resume_ia VARCHAR(255) NULL AFTER confiance_ia,
  ADD COLUMN articles_sujet JSON NULL AFTER resume_ia,
  ADD COLUMN analyse_ia JSON NULL AFTER articles_sujet,
  ADD INDEX idx_signalements_categorie_ia (categorie_ia),
  ADD INDEX idx_signalements_erosion (erosion_detectee);

INSERT INTO contenus_educatifs (titre, slug, categorie, resume, contenu)
SELECT 'Comprendre l erosion urbaine', 'comprendre-erosion-urbaine', 'Erosion',
       'Identifier les ravines, sols nus et zones fragilisees par le ruissellement.',
       'Une erosion visible doit etre documentee avec photo, position GPS et description du terrain. Les caniveaux bouches et les sols denudes aggravent rapidement le risque.'
WHERE NOT EXISTS (
  SELECT 1 FROM contenus_educatifs WHERE slug = 'comprendre-erosion-urbaine'
);

INSERT INTO contenus_educatifs (titre, slug, categorie, resume, contenu)
SELECT 'Proteger les pentes et caniveaux', 'proteger-pentes-caniveaux', 'Prevention',
       'Limiter le ruissellement et surveiller les zones sensibles apres de fortes pluies.',
       'La vegetation, le curage des caniveaux et la protection des pentes reduisent les degats. Signalez les fissures, ravines et affaissements des leur apparition.'
WHERE NOT EXISTS (
  SELECT 1 FROM contenus_educatifs WHERE slug = 'proteger-pentes-caniveaux'
);

INSERT INTO contenus_educatifs (titre, slug, categorie, resume, contenu)
SELECT 'Dechets electroniques', 'dechets-electroniques', 'Tri',
       'Mettre a part piles, batteries, cables et petits appareils.',
       'Les composants electroniques peuvent contenir des metaux et produits toxiques. Evitez de les melanger aux ordures courantes et signalez les depots importants.'
WHERE NOT EXISTS (
  SELECT 1 FROM contenus_educatifs WHERE slug = 'dechets-electroniques'
);

INSERT INTO contenus_educatifs (titre, slug, categorie, resume, contenu)
SELECT 'Dechets dangereux', 'dechets-dangereux', 'Sante',
       'Reconnaitre les huiles, produits chimiques, batteries et objets a risque.',
       'Ne touchez pas directement les dechets dangereux. Gardez une distance, ajoutez une photo claire et priorisez le signalement pour une intervention adaptee.'
WHERE NOT EXISTS (
  SELECT 1 FROM contenus_educatifs WHERE slug = 'dechets-dangereux'
);

INSERT INTO contenus_educatifs (titre, slug, categorie, resume, contenu)
SELECT 'Objets encombrants', 'objets-encombrants', 'Collecte',
       'Organiser le retrait des gros volumes sans bloquer la route ou les caniveaux.',
       'Les meubles, gravats et gros objets doivent etre regroupes proprement et signales avec precision afin de faciliter la collecte specialisee.'
WHERE NOT EXISTS (
  SELECT 1 FROM contenus_educatifs WHERE slug = 'objets-encombrants'
);
