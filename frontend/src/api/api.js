import axios from 'axios';
import { getToken } from '../auth/auth';
import toastService from './toastService';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
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

// Response interceptor para tratar requisições globais
// se precisar que alguma rota não pegue o toast, colocar um if com uma lista das rotas que não deve pegar
api.interceptors.response.use(
  (response) => {
    const message = response.data?.message || 'Sua requisição foi realizada com sucesso!';
    if (message) {
      toastService.success('Sucesso', message);
    }
    return response;
  },
  (error) => {
    if(error.message) {
      const message = error.response?.data?.message || 'Ocorreu um erro inesperado.';
      toastService.error('Erro', message);
    } else if (error.request) {
      toastService.error('Erro de conexão com o backend', 'Não foi possivel conectar ao servidor');
    } else {
      toastService.error('Erro desconhecido', error.message);
    }
    return Promise.reject(error);
  }
);

// Função específica para buscar dados do usuário
export const fetchUserData = async () => {
  try {
    const response = await api.get('/home/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Função específica para buscar dados do projeto
export const fetchProjects = async () => {
  try {
    const response = await api.get('/projetos/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    throw error;
  }
};

export default api;