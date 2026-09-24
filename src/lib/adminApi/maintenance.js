/**
 * adminApi.maintenance — all API calls for the Maintenance section.
 *
 * Endpoints consumed:
 *   Page content  → GET/PUT  /api/v1/admin/maintenance/page-content
 *   Packages      → GET/POST/PUT/DELETE  /api/v1/admin/packages
 *   Svc requests  → GET/PATCH/DELETE  /api/v1/admin/maintenance/service-requests
 */

import { request } from './client';

const BASE = '/api/v1/admin/maintenance';
const PKG  = '/api/v1/admin/packages';

export const maintenanceApi = {
  // ── Page content ────────────────────────────────────────────────────────────
  pageContent: {
    get: () => request(`${BASE}/page-content`),
    update: (payload) =>
      request(`${BASE}/page-content`, { method: 'PUT', body: payload }),
  },

  // ── Maintenance packages (Basic / Standard / Premium…) ──────────────────────
  packages: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`${PKG}${qs ? `?${qs}` : ''}`);
    },
    create: (payload) => request(PKG, { method: 'POST', body: payload }),
    update: (id, payload) => request(`${PKG}/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`${PKG}/${id}`, { method: 'DELETE' }),
  },

  // ── Service requests (customer booking leads) ────────────────────────────────
  serviceRequests: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`${BASE}/service-requests${qs ? `?${qs}` : ''}`);
    },
    update: (id, payload) =>
      request(`${BASE}/service-requests/${id}`, { method: 'PATCH', body: payload }),
    remove: (id) =>
      request(`${BASE}/service-requests/${id}`, { method: 'DELETE' }),
  },
};
