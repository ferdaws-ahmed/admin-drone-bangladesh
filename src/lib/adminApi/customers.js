import { request } from './client';

const BASE = '/api/v1/admin/auth/customers';

export const customersApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`${BASE}${qs ? `?${qs}` : ''}`);
  },
  delete: (id) => request(`${BASE}/${id}`, { method: 'DELETE' }),
  toggleFreeze: (id) => request(`${BASE}/${id}/freeze`, { method: 'PATCH' }),
};
