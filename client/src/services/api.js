const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({ baseURL: BASE });

// Attach JWT token from localStorage on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Photos
export const getPhotos = (params) => API.get('/photos', { params });
export const getPhoto = (id) => API.get(`/photos/${id}`);
export const uploadPhoto = (formData) =>
  API.post('/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const likePhoto = (id) => API.patch(`/photos/${id}/like`);
export const deletePhoto = (id) => API.delete(`/photos/${id}`);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

export default API;
