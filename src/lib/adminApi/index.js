import { request, API_BASE, STORE_URL, getToken, clearAuth, setAuth, getUser } from './client';
import { productsApi } from './products';
import { ordersApi } from './orders';
import { customersApi } from './customers';
import { cmsApi } from './cms';
import { settingsApi } from './settings';
import { couponsApi } from './coupons';
import { contactApi } from './contact';
import { maintenanceApi } from './maintenance';
import { homepageApi } from './homepage';


const adminApi = {
  base: API_BASE,
  storeUrl: STORE_URL,

  auth: {
    login: (email, password) =>
      request('/api/v1/admin/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      }),
    logout: clearAuth,
    setAuth,
    getUser,
    getToken,
    clearAuth,
  },

  get: (p, o) => request(p, { ...o, method: 'GET' }),
  post: (p, body, o) => request(p, { ...o, method: 'POST', body }),
  put: (p, body, o) => request(p, { ...o, method: 'PUT', body }),
  patch: (p, body, o) => request(p, { ...o, method: 'PATCH', body }),
  del: (p, body, o) => request(p, { ...o, method: 'DELETE', body }),

  // Module Mappings
  dashboard: {
    stats: ordersApi.stats,
  },
  products: productsApi,
  orders: ordersApi,
  customers: customersApi,
  cms: cmsApi,
  settings: settingsApi,
  coupons: couponsApi,
  contact: contactApi,
  maintenance: maintenanceApi,
  homepage: homepageApi,
  categories: {
    getAll: (type) => request(`/api/v1/admin/categories${type ? `?type=${type}` : ''}`),
    create: (payload) => request('/api/v1/admin/categories', { method: 'POST', body: payload }),
    delete: (id) => request(`/api/v1/admin/categories/${id}`, { method: 'DELETE' }),
  },
  handhelds: {
    createHandheld: (payload) => request('/api/v1/admin/handhelds', { method: 'POST', body: payload }),
    getByCategory: (category) => request(`/api/v1/admin/handhelds/by-category?category=${category}`),
  },

  // Compatibility mapping 
  admin: {
    products: productsApi,
    settings: settingsApi,
  },

  me: {
    get: () => request('/api/v1/admin/me'),
    update: (payload) => request('/api/v1/admin/me', { method: 'PUT', body: payload }),
  },
};

export default adminApi;
export { API_BASE, STORE_URL };