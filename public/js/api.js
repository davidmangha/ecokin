(function () {
  const API_BASE = '/api';
  const TOKEN_KEY = 'ecokin_token';
  const USER_KEY = 'ecokin_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  async function request(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    const config = {
      method: options.method || 'GET',
      headers
    };

    if (options.auth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    if (options.body instanceof FormData) {
      config.body = options.body;
    } else if (options.body) {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE}${path}`, config);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : {};

    if (!response.ok) {
      const error = new Error(data.message || 'Une erreur est survenue.');
      error.status = response.status;
      throw error;
    }

    return data;
  }

  window.EcoKin = window.EcoKin || {};
  window.EcoKin.api = {
    request,
    getToken,
    setSession,
    clearSession,
    getStoredUser
  };
})();
