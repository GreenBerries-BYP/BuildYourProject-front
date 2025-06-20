import axios from 'axios';
import { getToken } from '../auth/auth';

const dispatchToastEvent = (severity, summary, detail) => {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { severity, summary, detail }
  }));
}

const instance = axios.create({
  baseURL: 'https://byp-backend-o4ku.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
instance.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para tratar erros globais
instance.interceptors.response.use(
  (response) => {
    if(response.config.method !== 'get' && response.config.method !== 'head') {
      const message = response.data?.message || 'Operation successful';
      if (!response.config.handleErrorLocally) {
        dispatchToastEvent('success', 'Success', message);
      }
    }
    return response;
  },
  (error) => {
    // Check if the request config has a flag to handle the error locally
    if (error.config && error.config.handleErrorLocally) {
      
   return Promise.reject(error); // Skip global handling
    }

    let summary = 'Error';
    let detail = 'An unexpected error occurred.';
    let severity = 'error'; // Default severity

    if (error.response) {
      summary = `Error ${error.response.status}`;
      detail = error.response.data?.message || error.response.data?.detail || 'Server error';
      
      if (error.response.status === 404) {
        severity = 'warn';
        detail = `Resource not found: ${error.config.url}`;
      } else if (error.response.status >= 400 && error.response.status < 500) {
        severity = 'warn'; // Or 'error' depending on how you want to treat client errors
      }
      // Server errors (5xx) will remain 'error'
    } else if (error.request) {
      summary = 'Network Error';
      detail = 'No response received from server. Check your connection.';
    } else {
      detail = error.message;
    }
    
    dispatchToastEvent(severity, summary, detail);

      return Promise.reject(error); // Skip global handling, error will be caught by the component
    }
);

// Função específica para buscar dados do usuário
export const fetchUserData = async () => {
  try {
    const response = await instance.get('/home/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Função específica para buscar dados do projeto
export const fetchProjects = async () => {
  try {
    const response = await instance.get('/projetos/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    throw error;
  }
};

export default instance;