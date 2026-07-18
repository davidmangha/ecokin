(function () {
  const protectedPages = new Set(['dashboard', 'signaler', 'profil', 'administration']);

  function currentPage() {
    return document.body.dataset.page || 'accueil';
  }

  function redirectToLogin() {
    const target = encodeURIComponent(window.location.pathname);
    window.location.href = `/connexion.html?redirect=${target}`;
  }

  function redirectAfterLogin() {
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get('redirect') || '/dashboard.html';
  }

  async function fetchCurrentUser() {
    if (!window.EcoKin.api.getToken()) return null;

    try {
      const data = await window.EcoKin.api.request('/auth/me', { auth: true });
      localStorage.setItem('ecokin_user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      window.EcoKin.api.clearSession();
      return null;
    }
  }

  function setupNavigation(user) {
    const authOnly = document.querySelectorAll('[data-auth-only]');
    const guestOnly = document.querySelectorAll('[data-guest-only]');
    const adminOnly = document.querySelectorAll('[data-admin-only]');
    const userLabel = document.querySelector('[data-user-label]');

    authOnly.forEach((el) => el.classList.toggle('d-none', !user));
    guestOnly.forEach((el) => el.classList.toggle('d-none', Boolean(user)));
    adminOnly.forEach((el) => el.classList.toggle('d-none', !user || user.role !== 'admin'));

    if (userLabel && user) {
      userLabel.textContent = user.nom;
    }

    document.querySelectorAll('[data-page-link]').forEach((link) => {
      link.classList.toggle('active', link.dataset.pageLink === currentPage());
    });
  }

  function bindLogout() {
    document.querySelectorAll('[data-logout]').forEach((button) => {
      button.addEventListener('click', () => {
        window.EcoKin.api.clearSession();
        window.location.href = '/connexion.html';
      });
    });
  }

  async function guardPage() {
    const page = currentPage();
    let user = window.EcoKin.api.getStoredUser();

    if (protectedPages.has(page)) {
      user = await fetchCurrentUser();

      if (!user) {
        redirectToLogin();
        return null;
      }

      if (page === 'administration' && user.role !== 'admin') {
        window.location.href = '/dashboard.html';
        return null;
      }
    } else if (window.EcoKin.api.getToken()) {
      user = await fetchCurrentUser();
    }

    setupNavigation(user);
    bindLogout();
    return user;
  }

  function bindRegisterForm() {
    const form = document.querySelector('#registerForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const alert = document.querySelector('#registerAlert');
      alert.innerHTML = '';

      const body = Object.fromEntries(new FormData(form).entries());

      try {
        const data = await window.EcoKin.api.request('/auth/register', {
          method: 'POST',
          body
        });

        window.EcoKin.api.setSession(data.token, data.user);
        redirectAfterLogin();
      } catch (error) {
        alert.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      }
    });
  }

  function bindLoginForm() {
    const form = document.querySelector('#loginForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const alert = document.querySelector('#loginAlert');
      alert.innerHTML = '';

      const body = Object.fromEntries(new FormData(form).entries());

      try {
        const data = await window.EcoKin.api.request('/auth/login', {
          method: 'POST',
          body
        });

        window.EcoKin.api.setSession(data.token, data.user);
        redirectAfterLogin();
      } catch (error) {
        alert.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      }
    });
  }

  window.EcoKin = window.EcoKin || {};
  window.EcoKin.auth = {
    guardPage,
    bindRegisterForm,
    bindLoginForm,
    fetchCurrentUser
  };
})();
