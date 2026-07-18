(function () {
  const kinshasaCenter = [-4.325, 15.322];

  function formatDate(value) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  function text(value, fallback = '-') {
    return value === null || value === undefined || value === '' ? fallback : value;
  }

  function html(value, fallback = '-') {
    return String(text(value, fallback))
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function statusBadge(status) {
    return `<span class="badge-status" data-status="${status}">${status.replace('_', ' ')}</span>`;
  }

  async function loadCommunes(selectors = '.commune-select') {
    const selects = document.querySelectorAll(selectors);
    if (!selects.length) return [];

    const { communes } = await window.EcoKin.api.request('/communes');
    selects.forEach((select) => {
      const current = select.value;
      select.innerHTML = '<option value="">Choisir une commune</option>';
      communes.forEach((commune) => {
        const option = document.createElement('option');
        option.value = commune.id;
        option.textContent = commune.nom;
        select.appendChild(option);
      });
      select.value = current;
    });

    return communes;
  }

  function addTiles(map) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
  }

  function markerColor(status) {
    if (status === 'resolu') return '#1f7a4d';
    if (status === 'en_cours') return '#087f8c';
    if (status === 'rejete') return '#b42318';
    return '#f2a541';
  }

  function addSignalementMarkers(map, signalements) {
    signalements.forEach((item) => {
      if (!item.latitude || !item.longitude) return;

      const marker = L.circleMarker([Number(item.latitude), Number(item.longitude)], {
        radius: 8,
        color: markerColor(item.statut),
        fillColor: markerColor(item.statut),
        fillOpacity: 0.82,
        weight: 2
      }).addTo(map);

      const photo = item.photo_url
        ? `<img src="${item.photo_url}" class="incident-photo mb-2" alt="Photo du signalement">`
        : '';

      marker.bindPopup(`
        <div class="fw-bold mb-1">${html(item.titre)}</div>
        ${photo}
        <div class="small text-muted">${html(item.commune_nom)} - ${html(item.type_dechet)}</div>
        <div class="mt-2">${statusBadge(item.statut)}</div>
      `);
    });
  }

  async function initHome() {
    if (!document.querySelector('#homeMap') || typeof L === 'undefined') return;

    const map = L.map('homeMap', { scrollWheelZoom: false }).setView(kinshasaCenter, 11);
    addTiles(map);

    const { signalements } = await window.EcoKin.api.request('/signalements');
    addSignalementMarkers(map, signalements);
    document.querySelector('[data-home-count]').textContent = signalements.length;
  }

  async function initDashboard() {
    const root = document.querySelector('#dashboardStats');
    if (!root) return;

    const { stats } = await window.EcoKin.api.request('/dashboard/stats', { auth: true });
    const totals = stats.totals || {};

    root.innerHTML = `
      <div class="col-md-3"><div class="surface stat-card"><div class="stat-label">Signalements</div><div class="stat-value">${totals.total || 0}</div></div></div>
      <div class="col-md-3"><div class="surface stat-card"><div class="stat-label">Nouveaux</div><div class="stat-value">${totals.nouveaux || 0}</div></div></div>
      <div class="col-md-3"><div class="surface stat-card"><div class="stat-label">En cours</div><div class="stat-value">${totals.en_cours || 0}</div></div></div>
      <div class="col-md-3"><div class="surface stat-card"><div class="stat-label">Resolus</div><div class="stat-value">${totals.resolus || 0}</div></div></div>
    `;

    const typeList = document.querySelector('#typeStats');
    typeList.innerHTML = stats.byType.map((item) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${html(item.type_dechet)}</span>
        <span class="badge text-bg-success">${item.total}</span>
      </li>
    `).join('') || '<li class="list-group-item empty-state">Aucune donnee.</li>';

    const recentRows = document.querySelector('#recentSignalements');
    recentRows.innerHTML = stats.recent.map((item) => `
      <tr>
        <td>${html(item.titre)}</td>
        <td>${html(item.commune_nom)}</td>
        <td>${html(item.type_dechet)}</td>
        <td>${statusBadge(item.statut)}</td>
        <td>${formatDate(item.created_at)}</td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="empty-state">Aucun signalement.</td></tr>';
  }

  async function initSignalementForm() {
    const form = document.querySelector('#signalementForm');
    if (!form) return;

    await loadCommunes();

    const geoButton = document.querySelector('#geoButton');
    const alert = document.querySelector('#signalementAlert');

    geoButton.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert.innerHTML = '<div class="alert alert-warning">La geolocalisation nest pas disponible dans ce navigateur.</div>';
        return;
      }

      geoButton.disabled = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.latitude.value = position.coords.latitude.toFixed(7);
          form.longitude.value = position.coords.longitude.toFixed(7);
          geoButton.disabled = false;
        },
        () => {
          alert.innerHTML = '<div class="alert alert-danger">Impossible de recuperer la position GPS.</div>';
          geoButton.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 12000 }
      );
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      alert.innerHTML = '';

      try {
        const data = await window.EcoKin.api.request('/signalements', {
          method: 'POST',
          body: new FormData(form),
          auth: true
        });

        alert.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        form.reset();
      } catch (error) {
        alert.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      }
    });
  }

  async function initMapPage() {
    const container = document.querySelector('#incidentMap');
    if (!container || typeof L === 'undefined') return;

    await loadCommunes('#mapCommuneFilter');

    const map = L.map('incidentMap').setView(kinshasaCenter, 11);
    addTiles(map);
    let layer = L.layerGroup().addTo(map);

    async function refresh() {
      const params = new URLSearchParams();
      const statut = document.querySelector('#mapStatusFilter').value;
      const commune = document.querySelector('#mapCommuneFilter').value;
      if (statut) params.set('statut', statut);
      if (commune) params.set('commune_id', commune);

      const { signalements } = await window.EcoKin.api.request(`/signalements?${params.toString()}`);
      layer.clearLayers();
      addSignalementMarkers(layer, signalements);
    }

    document.querySelector('#mapStatusFilter').addEventListener('change', refresh);
    document.querySelector('#mapCommuneFilter').addEventListener('change', refresh);
    await refresh();
  }

  async function initEducation() {
    const contentRoot = document.querySelector('#educationList');
    if (!contentRoot) return;

    const [{ contenus }, { campagnes }] = await Promise.all([
      window.EcoKin.api.request('/education/contenus'),
      window.EcoKin.api.request('/education/campagnes')
    ]);

    contentRoot.innerHTML = contenus.map((item) => `
      <div class="col-md-4">
        <article class="card content-card border-0 surface">
          <div class="card-body">
            <span class="badge text-bg-light align-self-start">${html(item.categorie)}</span>
            <h2 class="h5 mb-0">${html(item.titre)}</h2>
            <p class="text-muted mb-0">${html(item.resume)}</p>
            <p class="small mb-0">${html(item.contenu)}</p>
          </div>
        </article>
      </div>
    `).join('') || '<div class="empty-state">Aucun contenu educatif.</div>';

    const campaignRoot = document.querySelector('#campaignList');
    campaignRoot.innerHTML = campagnes.map((item) => `
      <div class="list-group-item">
        <div class="d-flex justify-content-between gap-3">
          <div>
            <div class="fw-bold">${html(item.titre)}</div>
            <div class="text-muted small">${html(item.commune_nom)} - ${html(item.lieu)}</div>
          </div>
          <span class="badge text-bg-warning align-self-start">${html(item.statut)}</span>
        </div>
        <p class="mb-0 mt-2">${html(item.description)}</p>
      </div>
    `).join('') || '<div class="empty-state">Aucune campagne active.</div>';
  }

  async function initProfile(user) {
    const form = document.querySelector('#profileForm');
    if (!form) return;

    await loadCommunes();
    form.nom.value = user.nom || '';
    form.email.value = user.email || '';
    form.telephone.value = user.telephone || '';
    form.commune_id.value = user.commune_id || '';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const alert = document.querySelector('#profileAlert');
      alert.innerHTML = '';

      try {
        const body = Object.fromEntries(new FormData(form).entries());
        delete body.email;
        const data = await window.EcoKin.api.request('/users/profile', {
          method: 'PUT',
          body,
          auth: true
        });
        localStorage.setItem('ecokin_user', JSON.stringify(data.user));
        alert.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      } catch (error) {
        alert.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      }
    });
  }

  async function initAdmin() {
    const root = document.querySelector('#adminUsers');
    if (!root) return;

    async function loadAdmin() {
      const [{ overview }, { signalements }] = await Promise.all([
        window.EcoKin.api.request('/admin/overview', { auth: true }),
        window.EcoKin.api.request('/admin/signalements', { auth: true })
      ]);

      root.innerHTML = overview.users.map((user) => `
        <tr>
          <td>${html(user.nom)}</td>
          <td>${html(user.email)}</td>
          <td>${html(user.commune_nom)}</td>
          <td>
            <select class="form-select form-select-sm" data-role-user="${user.id}">
              ${['citoyen', 'collecteur', 'admin'].map((role) => `<option value="${role}" ${role === user.role ? 'selected' : ''}>${role}</option>`).join('')}
            </select>
          </td>
          <td>${statusBadge(user.statut)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" data-toggle-user="${user.id}" data-status="${user.statut === 'actif' ? 'suspendu' : 'actif'}">
              ${user.statut === 'actif' ? 'Suspendre' : 'Activer'}
            </button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="6" class="empty-state">Aucun utilisateur.</td></tr>';

      const incidentRoot = document.querySelector('#adminSignalements');
      incidentRoot.innerHTML = signalements.map((item) => `
        <tr>
          <td>${html(item.titre)}</td>
          <td>${html(item.commune_nom)}</td>
          <td>${html(item.type_dechet)}</td>
          <td>
            <select class="form-select form-select-sm" data-status-signalement="${item.id}">
              ${['nouveau', 'en_cours', 'resolu', 'rejete'].map((statut) => `<option value="${statut}" ${statut === item.statut ? 'selected' : ''}>${statut.replace('_', ' ')}</option>`).join('')}
            </select>
          </td>
          <td>${formatDate(item.created_at)}</td>
          <td><button class="btn btn-sm btn-outline-danger" data-delete-signalement="${item.id}">Supprimer</button></td>
        </tr>
      `).join('') || '<tr><td colspan="6" class="empty-state">Aucun signalement.</td></tr>';
    }

    document.addEventListener('change', async (event) => {
      if (event.target.matches('[data-role-user]')) {
        await window.EcoKin.api.request(`/admin/users/${event.target.dataset.roleUser}/role`, {
          method: 'PATCH',
          body: { role: event.target.value },
          auth: true
        });
      }

      if (event.target.matches('[data-status-signalement]')) {
        await window.EcoKin.api.request(`/admin/signalements/${event.target.dataset.statusSignalement}/status`, {
          method: 'PATCH',
          body: { statut: event.target.value },
          auth: true
        });
      }
    });

    document.addEventListener('click', async (event) => {
      if (event.target.matches('[data-toggle-user]')) {
        await window.EcoKin.api.request(`/admin/users/${event.target.dataset.toggleUser}/status`, {
          method: 'PATCH',
          body: { statut: event.target.dataset.status },
          auth: true
        });
        await loadAdmin();
      }

      if (event.target.matches('[data-delete-signalement]')) {
        await window.EcoKin.api.request(`/admin/signalements/${event.target.dataset.deleteSignalement}`, {
          method: 'DELETE',
          auth: true
        });
        await loadAdmin();
      }
    });

    await loadAdmin();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.EcoKin.auth.guardPage();
    if (user === null && ['dashboard', 'signaler', 'profil', 'administration'].includes(document.body.dataset.page)) {
      return;
    }

    window.EcoKin.auth.bindRegisterForm();
    window.EcoKin.auth.bindLoginForm();

    const page = document.body.dataset.page;
    if (page === 'accueil') await initHome();
    if (page === 'inscription') await loadCommunes();
    if (page === 'dashboard') await initDashboard();
    if (page === 'signaler') await initSignalementForm();
    if (page === 'carte') await initMapPage();
    if (page === 'sensibilisation') await initEducation();
    if (page === 'profil') await initProfile(user);
    if (page === 'administration') await initAdmin();
  });
})();
