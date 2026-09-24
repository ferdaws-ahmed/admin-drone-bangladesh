import { request } from './client';

const BASE = '/api/v1/admin/homepage';

export const homepageApi = {
  // ── Featured Categories ─────────────────────────────────────────────────────
  categories: {
    getAll: () => request(`${BASE}/featured-categories`),
    toggle: (id) => request(`${BASE}/featured-categories/${id}`, { method: 'PATCH' }),
  },

  // ── Product Homepage Flags ──────────────────────────────────────────────────
  productFlags: {
    getAll: () => request(`${BASE}/product-flags`),
    update: (id, flag, value) =>
      request(`${BASE}/product-flags/${id}`, {
        method: 'PATCH',
        body: { flag, value },
      }),
  },

  // ── Honorable Customers ─────────────────────────────────────────────────────
  customers: {
    getAll: () => request(`${BASE}/honorable-customers`),
    create: (payload) =>
      request(`${BASE}/honorable-customers`, { method: 'POST', body: payload }),
    update: (id, payload) =>
      request(`${BASE}/honorable-customers/${id}`, { method: 'PUT', body: payload }),
    remove: (id) =>
      request(`${BASE}/honorable-customers/${id}`, { method: 'DELETE' }),
  },
};
