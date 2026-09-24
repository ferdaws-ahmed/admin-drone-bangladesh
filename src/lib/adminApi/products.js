import client from './client';

export const getAdminProducts = async (params = {}) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const response = await client.get(`/api/v1/admin/products${query}`);
  return response;
};

export const getAdminProduct = async (id, productType) => {
  const query = productType ? `?productType=${encodeURIComponent(productType)}` : '';
  return client.get(`/api/v1/admin/products/${id}${query}`);
};

export const createProduct = async (productData) => {
  const response = await client.post('/api/v1/admin/products', productData);
  return response;
};

export const updateProduct = async (id, productData) => {
  const response = await client.put(`/api/v1/admin/products/${id}`, productData);
  return response;
};

export const deleteProduct = async (id, productType) => {
  const query = productType ? `?productType=${encodeURIComponent(productType)}` : '';
  const response = await client.delete(`/api/v1/admin/products/${id}${query}`);
  return response;
};

export const productsApi = {
  list: getAdminProducts,
  getProducts: getAdminProducts,
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productsApi;