import { request } from './client';

export const cmsApi = {
  articles: {
    list: (params = '') => request(`/api/v1/admin/cms/articles${params ? '?' + new URLSearchParams(params) : ''}`),
    create: (payload) => request('/api/v1/admin/cms/articles', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/api/v1/admin/cms/articles/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/api/v1/admin/cms/articles/${id}`, { method: 'DELETE' }),
  },
  banners: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/api/v1/admin/cms/banners${qs ? `?${qs}` : ''}`);
    },
    create: (payload) => request('/api/v1/admin/cms/banners', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/api/v1/admin/cms/banners/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => request(`/api/v1/admin/cms/banners/${id}`, { method: 'DELETE' }),
    setLive: (id) => request(`/api/v1/admin/cms/banners/${id}/live`, { method: 'PATCH' }),
  },
};