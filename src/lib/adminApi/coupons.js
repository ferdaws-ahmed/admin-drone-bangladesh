import { request } from './client';

export const couponsApi = {
  list: () => request('/api/v1/admin/coupons'),
  create: (payload) => request('/api/v1/admin/coupons', { method: 'POST', body: payload }),
  delete: (id) => request(`/api/v1/admin/coupons/${id}`, { method: 'DELETE' }),
};
