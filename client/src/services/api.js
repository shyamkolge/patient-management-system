const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ACCESS_TOKEN_KEY = 'prms_access_token';
const REFRESH_TOKEN_KEY = 'prms_refresh_token';

export const tokenStorage = {
  getAccess() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens({ accessToken, refreshToken }) {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const buildHeaders = (extra = {}, withAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = tokenStorage.getAccess();
  if (withAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    const message = data?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

const refreshAccessToken = async () => {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: buildHeaders({}, false),
    body: JSON.stringify({ refreshToken }),
  });

  const data = await parseResponse(response);
  const accessToken = data?.data?.accessToken;
  if (accessToken) {
    tokenStorage.setTokens({ accessToken });
  }
  return accessToken;
};

const request = async (path, options = {}, retry = false) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers || {}, options.withAuth !== false),
  });

  if (response.status === 401 && !retry) {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return request(path, options, true);
      }
    } catch (error) {
      tokenStorage.clear();
      throw error;
    }
  }

  return parseResponse(response);
};

export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) =>
    request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (path, body, options = {}) =>
    request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body, options = {}) =>
    request(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};
