'use client';

export const API_BASE = 'http://localhost:5000'; // Temporarily hardcoded for testing
export const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 25000;

const STORAGE_KEYS = { token: 'admin_token', user: 'admin_user' };

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEYS.token);
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEYS.token);
  window.localStorage.removeItem(STORAGE_KEYS.user);
  document.cookie = 'admin_token=; Path=/; Max-Age=0; SameSite=Lax';
};

export const setAuth = ({ token, user }) => {
  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem(STORAGE_KEYS.token, token);
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `admin_token=${token}; Path=/; Max-Age=604800; SameSite=Lax${isHttps ? '; Secure' : ''}`;
  }

  if (user) {
    window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const buildHeaders = (includeAuth, isFormData = false, extra = {}) => {
  const headers = { ...extra };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (includeAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export async function request(path, options = {}) {
  const { method = 'GET', body, auth = true, headers: extraHeaders = {}, timeout = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timer = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const fullUrl = `${API_BASE}${path}`;
  console.log(`API Request: ${method} ${fullUrl}`, { API_BASE, path, auth });

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: buildHeaders(auth, isFormData, extraHeaders),
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });

    if (res.status === 401) clearAuth();

    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : { success: res.ok, message: await res.text() };

    if (!res.ok) {
      throw new Error(data.message || `HTTP Error ${res.status}`);
    }

    return { data, success: true, ...data };
  } catch (err) {
    console.error(`API Request Error [${method} ${path}]:`, err);
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// 🟢 Axios Like Helper Methods to resolve Build Error
export const client = {
  get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body }),
  put: (url, body, options = {}) => request(url, { ...options, method: 'PUT', body }),
  patch: (url, body, options = {}) => request(url, { ...options, method: 'PATCH', body }),
  delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' }),
};

export default client;