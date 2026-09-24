import { request } from './client';

export const settingsApi = {
  get: () => request('/api/v1/admin/settings'),
  update: (payload) => request('/api/v1/admin/settings', { method: 'PUT', body: payload }),
  summary: () => request('/api/v1/admin/settings/summary'),
};