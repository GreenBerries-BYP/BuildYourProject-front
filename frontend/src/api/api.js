import axios from 'axios';
import { getToken } from '../auth/auth';
import toastService from './toastService';

const api = axios.create({
  baseURL: 'https://byp-backend-o4ku.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getToken();

    // Lista de rotas que não precisam de Authorization
    const publicRoutes = ["/register/", "/login/"];

    if (token && !publicRoutes.some((route) => config.url.includes(route))) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para tratar requisições globais
// se precisar que alguma rota não pegue o toast, colocar um if com uma lista das rotas que não deve pegar
api.interceptors.response.use(
  (response) => {
    return response; // Retorna apenas a resposta sem disparar toast
  },
  (error) => {
    return Promise.reject(error); // Apenas rejeita, sem toast
  }
);


export const fetchUserData = async () => {
  try {
    const response = await api.get('/home/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};


export const fetchProjects = async () => {
  try {
    const response = await api.get('/projetos/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    throw error;
  }
};

export const fetchSharedWithMe = async () => {
  try {
    const response = await api.get('/projetos/sharewithme/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar projetos compartilhados comigo:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, isCompleted) => {
  try {
    const token = localStorage.getItem("token"); // token JWT obtido no login
    const response = await api.patch(
      `/tasks/${taskId}/`,
      { is_completed: isCompleted },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status da tarefa:", error);
    throw error;
  }
};

export const fetchProjectWithTasks = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/tasks/`);
    return response.data; // Deve retornar o objeto do projeto completo
  } catch (error) {
    console.error('Erro ao buscar projeto com tarefas:', error);
    throw error;
  }
};


export default api;
