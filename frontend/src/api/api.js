import axios from 'axios';
import { getToken } from '../auth/auth';
import toastService from './toastService';

const api = axios.create({
  baseURL: 'https://byp-backend-o4ku.onrender.com/api',
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getToken();

    // Lista de rotas que não precisam de Authorization
    const publicRoutes = ["/register/", "/login/", "/auth/google/", "/auth/send-reset-code/",    // ✅ ADICIONA ESTA
      "/auth/verify-reset-code/", "/auth/reset-password/"];
    
    const isPublicRoute = publicRoutes.some(route => 
      config.url.startsWith(route)
    );

    if (token && !isPublicRoute) {
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

// api.js - FUNÇÃO MELHORADA
export const fetchGoogleCalendarEventsDirect = async () => {
  try {
    const googleToken = localStorage.getItem('google_access_token');
    
    console.log('🔑 Token sendo usado:', googleToken ? '✅ Presente' : '❌ Ausente');
    
    if (!googleToken) {
      throw new Error("Token do Google não disponível");
    }

    // ✅ PARÂMETROS MELHORADOS
    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          maxResults: 20,
          orderBy: 'startTime',
          singleEvents: true,
          timeMin: new Date().toISOString(),
          timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Próximos 30 dias
        }
      }
    );
    
    console.log('✅ Resposta da API Google:', response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro detalhado:", error);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('🔐 Erro de autenticação - Token provavelmente expirado ou sem scopes');
      }
    }
    
    throw error;
  }
};


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

// atribuição de tarefas
export const assignTaskToUser = async (taskId, userId) => {
  try {
    const response = await api.post(`/tasks/${taskId}/assign/`, {
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atribuir tarefa:', error);
    throw error;
  }
};

export default api;
