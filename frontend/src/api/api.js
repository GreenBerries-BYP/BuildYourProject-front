import axios from 'axios';
import { getToken } from '../auth/auth';
import toastService from './toastService';

const api = axios.create({
  baseURL: 'https://byp-backend-o4ku.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Acess-Control-Alow-Origin: '*'', 
  },
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getToken();

    // Lista de rotas que não precisam de Authorization
    const publicRoutes = ["/register/", "/login/", "/auth/google/", "/auth/send-reset-code/",    // ✅ ADICIONA ESTA
      "/auth/verify-reset-code/", "/auth/reset-password/"];

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
    const response = await api.get(`/projetos/${projectId}/tasks/`);
    return response.data; // Deve retornar o objeto do projeto completo
  } catch (error) {
    console.error('Erro ao buscar projeto com tarefas:', error);
    throw error;
  }
};


export const updateTask = async (projectId, taskId, data) => {
  try {
    const response = await api.put(`/projetos/${projectId}/tasks/${taskId}/`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw error;
  }
};


export const updateSubtask = async (projectId, subtaskId, data) => {
  try {
    const response = await api.put(`/projetos/${projectId}/subtasks/${subtaskId}/`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar subtarefa:', error);
    throw error;
  }
};


// Adiciona esta função no seu api.js
export const fetchGoogleCalendarEvents = async () => {
  try {
    const token = localStorage.getItem("token"); // ou use getToken()
    const response = await api.get("/google/calendar/sync/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // eventos do Google Calendar
  } catch (error) {
    console.error("Erro ao buscar eventos do Google Calendar:", error);
    toastService.error(
      "Erro ao sincronizar calendário",
      "Não foi possível acessar seus eventos do Google Calendar"
    );
    throw error;
  }
};

// api.js - Adicione estas funções

export const analisarProjeto = async (projectId) => {
  try {
    const response = await api.post(`/projetos/${projectId}/analisar/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao analisar projeto:', error);
    throw error;
  }
};

export const aplicarSugestao = async (projectId, sugestaoId, acao) => {
  try {
    const response = await api.post(`/projetos/${projectId}/aplicar-sugestao/`, {
      sugestao_id: sugestaoId,
      acao: acao
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao aplicar sugestão:', error);
    throw error;
  }
};


export default api;
