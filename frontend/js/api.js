import { API_BASE } from './config.js';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (response.status === 401) {
    localStorage.clear();
    window.location.replace('login.html');
    return null;
  }
  return response;
}