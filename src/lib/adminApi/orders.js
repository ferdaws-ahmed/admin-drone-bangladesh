import { request } from './client';

export const ordersApi = {
  list: (params = '') => request(`/api/v1/admin/orders${params ? '?' + new URLSearchParams(params) : ''}`),
  get: (id) => request(`/api/v1/admin/orders/${id}`),
  delete: (id) => request(`/api/v1/admin/orders/${id}`, { method: 'DELETE' }),
  stats: () => request('/api/v1/admin/orders/stats'),
  setStatus: (id, payload) => request(`/api/v1/admin/orders/${id}/status`, { method: 'PATCH', body: payload }),
  sendToCourier: (id) => request(`/api/v1/admin/courier/orders/${id}/send`, { method: 'POST' }),
};