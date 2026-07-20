# EcoKin

EcoKin est une plateforme ecologique locale pour Kinshasa. Elle permet aux citoyens de creer un compte, signaler un incident de dechets avec photo et position GPS, consulter une carte interactive Leaflet, suivre des statistiques et administrer les utilisateurs ainsi que les signalements.

## Stack

- Front-end: HTML, CSS, JavaScript, Bootstrap, Leaflet
- Back-end: Node.js, Express
- Base de donnees: MySQL
- Architecture: MVC avec dossiers `routes`, `controllers`, `models`
- Uploads: `multer` vers le dossier `uploads`
- Authentification: JWT + mots de passe hashes avec `bcryptjs`
- IA photo: analyse optionnelle avec OpenAI Responses API pour detecter dechets et erosion

## Arborescence

```text
EcoKin/
  client/              Pages HTML
  controllers/         Controleurs MVC
  database/            Schema MySQL
  models/              Modeles MySQL
  public/              CSS et JavaScript front-end
  routes/              Routes Express
  server/              Configuration Express, DB et middlewares
  uploads/             Photos des signalements
```

## Installation locale

1. Installer les dependances:

```bash
npm install
```

2. Creer le fichier `.env` a partir de l'exemple:

```bash
cp .env.example .env
```

Sous Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Creer puis importer la base MySQL en local:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ecokin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p ecokin < database/schema.sql
```

4. Verifier les informations MySQL dans `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ecokin
JWT_SECRET=change_this_secret_for_local_development
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6
```

5. Lancer le projet:

```bash
npm run dev
```

Ou en mode production local:

```bash
npm start
```

L'application sera disponible sur:

```text
http://localhost:3000
```

## Pages incluses

- Accueil: `/index.html`
- Actualites: `/actualites.html`
- Inscription: `/inscription.html`
- Connexion: `/connexion.html`
- Tableau de bord: `/dashboard.html`
- Signaler un incident: `/signaler.html`
- Carte interactive: `/carte.html`
- Sensibilisation ecologique: `/sensibilisation.html`
- Profil utilisateur: `/profil.html`
- Administration: `/administration.html`

## Analyse IA des photos

Quand une photo est ajoutee a un signalement, EcoKin peut demander a OpenAI d'identifier le type de dechet, la presence d'erosion, un niveau de confiance et des articles de sensibilisation lies au sujet.

Pour l'activer sur Render, ajoutez ces variables dans `Environment`, puis relancez un deploy:

```env
OPENAI_API_KEY=votre_cle_openai
OPENAI_MODEL=gpt-5.6
```

Sans `OPENAI_API_KEY`, le signalement reste envoye normalement et l'analyse affiche un etat en attente.

Pour une base deja creee, appliquez la migration:

```bash
npm run migrate:ai
```

## Creer un administrateur

Inscrivez d'abord un utilisateur via `/inscription.html`, puis passez son role a `admin` dans MySQL:

```sql
UPDATE utilisateurs
SET role = 'admin'
WHERE email = 'votre-email@example.com';
```

Reconnectez-vous ensuite pour acceder a `/administration.html`.

## Routes API principales

- `POST /api/auth/register`: inscription
- `POST /api/auth/login`: connexion
- `GET /api/auth/me`: session courante
- `GET /api/communes`: liste des communes
- `GET /api/signalements`: liste publique des signalements
- `POST /api/signalements`: creation d'un signalement avec photo, position GPS, JWT et analyse IA optionnelle
- `GET /api/dashboard/stats`: statistiques du tableau de bord
- `GET /api/education/contenus`: contenus educatifs publies
- `GET /api/education/campagnes`: campagnes actives ou planifiees
- `GET /api/admin/overview`: donnees d'administration
- `PATCH /api/admin/users/:id/role`: gestion des roles
- `PATCH /api/admin/signalements/:id/status`: gestion des statuts de dechets
