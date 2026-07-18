SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS interventions;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS signalements;
DROP TABLE IF EXISTS collecteurs;
DROP TABLE IF EXISTS campagnes;
DROP TABLE IF EXISTS contenus_educatifs;
DROP TABLE IF EXISTS utilisateurs;
DROP TABLE IF EXISTS communes;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE communes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(120) NOT NULL UNIQUE,
  district VARCHAR(120) NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commune_id INT NULL,
  nom VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  telephone VARCHAR(40) NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('citoyen', 'collecteur', 'admin') NOT NULL DEFAULT 'citoyen',
  statut ENUM('actif', 'suspendu') NOT NULL DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_utilisateurs_communes
    FOREIGN KEY (commune_id) REFERENCES communes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE collecteurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NULL,
  commune_id INT NULL,
  nom_structure VARCHAR(180) NOT NULL,
  type_collecteur ENUM('public', 'prive', 'association') NOT NULL DEFAULT 'public',
  contact VARCHAR(120) NULL,
  zone VARCHAR(180) NULL,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_collecteurs_utilisateurs
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_collecteurs_communes
    FOREIGN KEY (commune_id) REFERENCES communes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE signalements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  commune_id INT NULL,
  titre VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  type_dechet ENUM('plastique', 'organique', 'electronique', 'dangereux', 'encombrant', 'autre') NOT NULL,
  adresse VARCHAR(255) NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  niveau_urgence ENUM('faible', 'moyen', 'eleve') NOT NULL DEFAULT 'moyen',
  statut ENUM('nouveau', 'en_cours', 'resolu', 'rejete') NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_signalements_utilisateurs
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_signalements_communes
    FOREIGN KEY (commune_id) REFERENCES communes(id)
    ON DELETE SET NULL,
  INDEX idx_signalements_statut (statut),
  INDEX idx_signalements_type_dechet (type_dechet),
  INDEX idx_signalements_position (latitude, longitude)
) ENGINE=InnoDB;

CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  signalement_id INT NOT NULL,
  url_photo VARCHAR(255) NOT NULL,
  nom_fichier VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photos_signalements
    FOREIGN KEY (signalement_id) REFERENCES signalements(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE interventions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  signalement_id INT NOT NULL,
  collecteur_id INT NULL,
  planifiee_le DATETIME NULL,
  realisee_le DATETIME NULL,
  statut ENUM('planifiee', 'en_cours', 'terminee', 'annulee') NOT NULL DEFAULT 'planifiee',
  commentaire TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_interventions_signalements
    FOREIGN KEY (signalement_id) REFERENCES signalements(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_interventions_collecteurs
    FOREIGN KEY (collecteur_id) REFERENCES collecteurs(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE contenus_educatifs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auteur_id INT NULL,
  titre VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  categorie VARCHAR(100) NOT NULL,
  resume VARCHAR(255) NULL,
  contenu TEXT NOT NULL,
  image_url VARCHAR(255) NULL,
  publie BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contenus_utilisateurs
    FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE campagnes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commune_id INT NULL,
  titre VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NULL,
  lieu VARCHAR(180) NULL,
  objectif VARCHAR(255) NULL,
  statut ENUM('planifiee', 'active', 'terminee', 'annulee') NOT NULL DEFAULT 'planifiee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_campagnes_communes
    FOREIGN KEY (commune_id) REFERENCES communes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO communes (nom, district, latitude, longitude) VALUES
('Bandalungwa', 'Funa', -4.3428800, 15.2764700),
('Barumbu', 'Lukunga', -4.3222500, 15.3269100),
('Gombe', 'Lukunga', -4.3006500, 15.3121500),
('Kalamu', 'Funa', -4.3443300, 15.3107600),
('Kintambo', 'Lukunga', -4.3231200, 15.2693100),
('Lemba', 'Mont-Amba', -4.3895300, 15.3390400),
('Limete', 'Funa', -4.3498300, 15.3524300),
('Lingwala', 'Lukunga', -4.3181200, 15.3016500),
('Masina', 'Tshangu', -4.3864300, 15.3912800),
('Matete', 'Mont-Amba', -4.3841200, 15.3483200),
('Mont-Ngafula', 'Mont-Amba', -4.4266700, 15.2755600),
('Ndjili', 'Tshangu', -4.3908000, 15.3665000),
('Ngaliema', 'Lukunga', -4.3387000, 15.2269000),
('Nsele', 'Tshangu', -4.3289000, 15.5214000);

INSERT INTO contenus_educatifs (titre, slug, categorie, resume, contenu) VALUES
('Trier les dechets menagers', 'trier-les-dechets-menagers', 'Tri',
 'Les gestes simples pour separer plastique, organique et dechets dangereux.',
 'Utilisez des sacs distincts pour les plastiques, les dechets organiques et les objets dangereux. Un tri clair rend la collecte plus rapide et limite les risques sanitaires.'),
('Eviter les depots sauvages', 'eviter-les-depots-sauvages', 'Citoyennete',
 'Pourquoi signaler les depots sauvages et comment proteger son quartier.',
 'Un depot sauvage attire les nuisances, bouche les caniveaux et augmente les risques d inondation. Signalez rapidement les points critiques avec photo et position GPS.'),
('Compostage urbain simple', 'compostage-urbain-simple', 'Reduction',
 'Transformer une partie des dechets organiques en ressource utile.',
 'Les restes de fruits, legumes et feuilles peuvent etre compostes dans un bac ferme et aere. Evitez la viande, les huiles et les produits chimiques.');

INSERT INTO campagnes (commune_id, titre, description, date_debut, date_fin, lieu, objectif, statut) VALUES
(3, 'Nettoyage citoyen de la Gombe',
 'Mobilisation locale pour retirer les dechets plastiques pres des axes frequentes.',
 CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 'Rond-point Forescom', 'Collecter 500 kg de plastiques', 'active'),
(7, 'Sensibilisation marche de Limete',
 'Atelier public sur le tri, la reduction et le signalement des depots sauvages.',
 DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 8 DAY), 'Marche de Limete', 'Former 200 vendeurs', 'planifiee');
