const fs = require('fs/promises');
const path = require('path');

const allowedCategories = new Set(['dechet', 'erosion', 'mixte', 'inconnu']);
const allowedWasteTypes = new Set([
  'plastique',
  'organique',
  'electronique',
  'dangereux',
  'encombrant',
  'autre',
  'inconnu'
]);

const articleLibrary = {
  plastique: [
    {
      titre: 'Trier les dechets menagers',
      resume: 'Separer les plastiques et emballages pour faciliter la collecte.',
      url: '/sensibilisation.html#trier-les-dechets-menagers'
    },
    {
      titre: 'Eviter les depots sauvages',
      resume: 'Signaler rapidement les points critiques avant qu ils s agrandissent.',
      url: '/sensibilisation.html#eviter-les-depots-sauvages'
    }
  ],
  organique: [
    {
      titre: 'Compostage urbain simple',
      resume: 'Transformer les restes alimentaires et feuilles en ressource utile.',
      url: '/sensibilisation.html#compostage-urbain-simple'
    }
  ],
  electronique: [
    {
      titre: 'Dechets electroniques',
      resume: 'Isoler piles, cables et appareils pour eviter la pollution des sols.',
      url: '/sensibilisation.html#dechets-electroniques'
    }
  ],
  dangereux: [
    {
      titre: 'Dechets dangereux',
      resume: 'Eviter le contact direct avec les huiles, batteries et produits chimiques.',
      url: '/sensibilisation.html#dechets-dangereux'
    }
  ],
  encombrant: [
    {
      titre: 'Objets encombrants',
      resume: 'Organiser une collecte dediee pour meubles, gravats et gros volumes.',
      url: '/sensibilisation.html#objets-encombrants'
    }
  ],
  erosion: [
    {
      titre: 'Comprendre l erosion urbaine',
      resume: 'Reconnaitre les ravines, sols nus et caniveaux fragilises.',
      url: '/sensibilisation.html#comprendre-erosion-urbaine'
    },
    {
      titre: 'Proteger les pentes et caniveaux',
      resume: 'Reduire le ruissellement et signaler les zones a risque.',
      url: '/sensibilisation.html#proteger-pentes-caniveaux'
    }
  ],
  autre: [
    {
      titre: 'Eviter les depots sauvages',
      resume: 'Documenter la zone avec photo, position GPS et description claire.',
      url: '/sensibilisation.html#eviter-les-depots-sauvages'
    }
  ],
  inconnu: [
    {
      titre: 'Eviter les depots sauvages',
      resume: 'Comparer la photo avec les principaux risques ecologiques.',
      url: '/sensibilisation.html#eviter-les-depots-sauvages'
    }
  ]
};

function fallbackAnalysis(message, extra = {}) {
  return {
    article_sujet: null,
    categorie_ia: 'inconnu',
    type_dechet_ia: 'inconnu',
    erosion_detectee: false,
    confiance_ia: null,
    resume_ia: message,
    articles_sujet: articleLibrary.inconnu,
    analyse_ia: {
      disponible: false,
      message,
      ...extra
    }
  };
}

function sanitizeText(value, maxLength = 255) {
  if (!value) return null;
  return String(value).replace(/\s+/g, ' ').trim().slice(0, maxLength) || null;
}

function normalizeCategory(value) {
  const normalized = sanitizeText(value, 40)?.toLowerCase();
  return allowedCategories.has(normalized) ? normalized : 'inconnu';
}

function normalizeWasteType(value) {
  const normalized = sanitizeText(value, 60)?.toLowerCase();
  if (!normalized) return 'inconnu';

  if (normalized.includes('plast')) return 'plastique';
  if (normalized.includes('organ') || normalized.includes('aliment')) return 'organique';
  if (normalized.includes('elect') || normalized.includes('batter') || normalized.includes('pile')) return 'electronique';
  if (normalized.includes('danger') || normalized.includes('chim') || normalized.includes('medical')) return 'dangereux';
  if (normalized.includes('encombr') || normalized.includes('grav') || normalized.includes('meuble')) return 'encombrant';

  return allowedWasteTypes.has(normalized) ? normalized : 'autre';
}

function normalizeConfidence(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return Math.max(0, Math.min(100, Number(percent.toFixed(2))));
}

function cleanJsonText(text) {
  if (!text) return '';
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function parseJsonResult(text) {
  const cleaned = cleanJsonText(text);
  if (!cleaned) {
    throw new Error('Reponse IA vide.');
  }

  return JSON.parse(cleaned);
}

function outputTextFromResponse(data) {
  if (data.output_text) return data.output_text;

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === 'output_text' || content.type === 'text')
    .map((content) => content.text || '')
    .join('\n');
}

function articlesFor(analysis) {
  const articles = [];

  if (analysis.erosion_detectee) {
    articles.push(...articleLibrary.erosion);
  }

  if (analysis.type_dechet_ia && articleLibrary[analysis.type_dechet_ia]) {
    articles.push(...articleLibrary[analysis.type_dechet_ia]);
  }

  if (!articles.length) {
    articles.push(...articleLibrary.inconnu);
  }

  return articles
    .filter((article, index, source) => source.findIndex((item) => item.url === article.url) === index)
    .slice(0, 3);
}

function normalizeAiResult(raw, model) {
  const categorie_ia = normalizeCategory(raw.categorie_ia || raw.categorie || raw.type_incident);
  const type_dechet_ia = normalizeWasteType(raw.type_dechet_ia || raw.type_dechet || raw.dechet);
  const erosion_detectee = Boolean(raw.erosion_detectee || categorie_ia === 'erosion' || categorie_ia === 'mixte');
  const article_sujet =
    sanitizeText(raw.sujet_articles || raw.article_sujet, 160) ||
    (erosion_detectee ? 'erosion urbaine' : null) ||
    (type_dechet_ia !== 'inconnu' ? type_dechet_ia : null);

  const analysis = {
    article_sujet,
    categorie_ia,
    type_dechet_ia,
    erosion_detectee,
    confiance_ia: normalizeConfidence(raw.confiance_ia || raw.confiance || raw.confidence),
    resume_ia:
      sanitizeText(raw.resume_ia || raw.resume || raw.observation, 255) ||
      'Analyse IA terminee, mais aucun resume exploitable n a ete renvoye.',
    articles_sujet: [],
    analyse_ia: {
      disponible: true,
      fournisseur: 'openai',
      modele: model,
      indices_visuels: Array.isArray(raw.indices_visuels)
        ? raw.indices_visuels.map((item) => sanitizeText(item, 120)).filter(Boolean).slice(0, 5)
        : []
    }
  };

  analysis.articles_sujet = articlesFor(analysis);
  return analysis;
}

async function analyzeIncidentPhoto(file) {
  if (!file?.path) {
    return fallbackAnalysis('Aucune photo disponible pour l analyse IA.');
  }

  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnalysis('Analyse IA en attente: ajoutez OPENAI_API_KEY dans les variables d environnement.');
  }

  if (typeof fetch !== 'function') {
    return fallbackAnalysis('Analyse IA indisponible: Node.js 18 ou plus est requis pour fetch.');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-5.6';
  const mimeType = file.mimetype || `image/${path.extname(file.path).replace('.', '') || 'jpeg'}`;
  const imageBase64 = await fs.readFile(file.path, 'base64');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.OPENAI_IMAGE_TIMEOUT_MS || 25000));

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text:
                  'Analyse cette photo pour EcoKin, une plateforme ecologique a Kinshasa. ' +
                  'Determine s il s agit de dechets, d erosion urbaine, des deux, ou si c est incertain. ' +
                  'Reponds uniquement en JSON strict avec les cles: categorie_ia (dechet|erosion|mixte|inconnu), ' +
                  'type_dechet_ia (plastique|organique|electronique|dangereux|encombrant|autre|inconnu), ' +
                  'erosion_detectee (boolean), confiance_ia (0-100), resume_ia (phrase courte), sujet_articles, indices_visuels (liste courte).'
              },
              {
                type: 'input_image',
                image_url: `data:${mimeType};base64,${imageBase64}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.error?.message || `Erreur OpenAI ${response.status}`;
      return fallbackAnalysis(`Analyse IA indisponible: ${message}`, {
        fournisseur: 'openai',
        modele: model,
        code: data.error?.code || response.status
      });
    }

    return normalizeAiResult(parseJsonResult(outputTextFromResponse(data)), model);
  } catch (error) {
    return fallbackAnalysis(`Analyse IA indisponible: ${error.message}`, {
      fournisseur: 'openai',
      modele: model
    });
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  analyzeIncidentPhoto
};
