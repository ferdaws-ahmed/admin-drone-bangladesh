import { request } from './client';

export const contactApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      query.append(key, String(value));
    });

    const qs = query.toString();
    return request(`/api/v1/admin/contact${qs ? `?${qs}` : ''}`);
  },
  stats: () => request('/api/v1/admin/contact/stats'),
  updateStatus: (id, status) =>
    request(`/api/v1/admin/contact/${id}/status`, {
      method: 'PUT',
      body: { status },
    }),
};
