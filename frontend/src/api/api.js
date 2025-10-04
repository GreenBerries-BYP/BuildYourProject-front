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

export const fetchProjectData = async (projectId) => {
  const token = localStorage.getItem('access_token');
  const response = await api.get(`/projetos/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Encontra o projeto específico na lista
  const projeto = response.data.find(p => p.id === projectId);
  return projeto;
};

// Função para buscar tarefas do projeto
export const fetchProjectTasks = async (projectId) => {
  const projeto = await fetchProjectWithTasks(projectId);
  return projeto.tarefasProjeto || [];
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

// api.js - GARANTIR QUE USA O ACCESS_TOKEN
export const fetchGoogleCalendarEventsDirect = async () => {
  try {
    const googleToken = localStorage.getItem('google_access_token');
    
    console.log('Token sendo usado:', googleToken ? 'Presente' : 'Ausente');
    
    if (!googleToken) {
      throw new Error("Token do Google não disponível");
    }

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
          timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    );
    
    console.log('Resposta da API Google:', response.data);
    return response.data;
  } catch (error) {
    console.error("Erro detalhado:", error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
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


export const fetchProjectCollaborators = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/collaborators/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    throw error;
  }
};

export const createGoogleCalendarEvent = async (evento) => {
  try {
    const googleToken = localStorage.getItem('google_access_token');
    
    if (!googleToken) {
      throw new Error("Token do Google não disponível");
    }

    console.log('📅 Criando evento:', evento);

    const response = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      evento,
      {
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Evento criado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    throw error;
  }
};

export const createGoogleCalendarEventFromTask = async (tarefa, nomeProjeto) => {
  try {
    const googleToken = localStorage.getItem('google_access_token');
    
    // Se não tem token do Google, apenas retorna sem erro (não é obrigatório)
    if (!googleToken) {
      console.log('Token do Google não disponível - evento não criado');
      return null;
    }

    // Formatar data da tarefa para o evento
    const dataEntrega = new Date(tarefa.dataEntrega);
    const startDateTime = new Date(dataEntrega);
    startDateTime.setHours(9, 0, 0, 0); // Início às 9:00
    
    const endDateTime = new Date(dataEntrega);
    endDateTime.setHours(10, 0, 0, 0); // Término às 10:00

    const evento = {
      summary: `[${nomeProjeto}] ${tarefa.nome}`,
      description: `Tarefa: ${tarefa.nome}\nDescrição: ${tarefa.descricao}\nProjeto: ${nomeProjeto}${tarefa.user ? `\nResponsável: ${tarefa.user}` : ''}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      reminders: {
        useDefault: true
      }
    };

    console.log('Criando evento no Google Calendar para tarefa:', evento);

    const response = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      evento,
      {
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Evento criado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar evento no Google Calendar:", error);
    
    // Não lança erro para não quebrar o fluxo de criação da tarefa
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    return null; // Retorna null em caso de erro
  }
};

// api.js - MODIFICAR FUNÇÃO PARA CRIAR EVENTOS BASEADOS NAS TAREFAS EXISTENTES
export const createGoogleCalendarEventsForProjectTasks = async (projetoId, nomeProjeto, tarefasComDatas = null) => {
  try {
    const googleToken = localStorage.getItem('google_access_token');
    
    if (!googleToken) {
      console.log('Token do Google não disponível - eventos não criados');
      return [];
    }

    // Se não foram passadas tarefas, busca do backend
    let tarefas;
    if (tarefasComDatas) {
      tarefas = tarefasComDatas;
    } else {
      const projetoComTarefas = await fetchProjectWithTasks(projetoId);
      tarefas = projetoComTarefas.tarefasProjeto || [];
    }

    const eventsCreated = [];

    // Criar evento para cada tarefa principal
    for (let i = 0; i < tarefas.length; i++) {
      const tarefa = tarefas[i];
      
      // Verificar se a tarefa tem datas válidas
      if (!tarefa.data_inicio || !tarefa.data_fim) {
        console.log(`Tarefa "${tarefa.nomeTarefa}" sem datas válidas - pulando`);
        continue;
      }

      // Garantir que as datas são objetos Date
      const startDateTime = new Date(tarefa.data_inicio);
      const endDateTime = new Date(tarefa.data_fim);

      const evento = {
        summary: `[${nomeProjeto}] ${tarefa.nomeTarefa}`,
        description: `Tarefa: ${tarefa.nomeTarefa}\nProjeto: ${nomeProjeto}\nDescrição: ${tarefa.descricao || 'Sem descrição'}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        reminders: {
          useDefault: true
        }
      };

      console.log(`Criando evento para tarefa "${tarefa.nomeTarefa}":`, evento);

      try {
        const response = await axios.post(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          evento,
          {
            headers: {
              'Authorization': `Bearer ${googleToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`Evento criado para tarefa "${tarefa.nomeTarefa}":`, response.data);
        eventsCreated.push(response.data);


      } catch (taskError) {
        console.error(`Erro ao criar evento para tarefa "${tarefa.nomeTarefa}":`, taskError);
      }
    }

    console.log(`Total de ${eventsCreated.length} eventos criados no Google Calendar`);
    return eventsCreated;
  } catch (error) {
    console.error("Erro geral ao criar eventos do projeto:", error);
    return [];
  }
};
export default api;
