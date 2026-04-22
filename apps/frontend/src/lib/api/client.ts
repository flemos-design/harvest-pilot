import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRedirecting = false;

// Request interceptor para adicionar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('harvestpilot_token') || sessionStorage.getItem('harvestpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para tratar erros globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpar token inválido
      localStorage.removeItem('harvestpilot_token');
      localStorage.removeItem('harvestpilot_user');
      sessionStorage.removeItem('harvestpilot_token');
      sessionStorage.removeItem('harvestpilot_user');
      document.cookie = 'hp_session=; path=/; max-age=0';

      // Redirecionar para login (evitar loop infinito)
      if (typeof window !== 'undefined' && !isRedirecting && !window.location.pathname.includes('/login')) {
        isRedirecting = true;
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
