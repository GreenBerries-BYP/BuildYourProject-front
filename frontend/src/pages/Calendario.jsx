import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { fetchGoogleCalendarEventsDirect } from "../api/api";
import { useAuthContext } from "../auth/authContext";
import toastService from "../api/toastService";
import { useForm, Controller } from "react-hook-form";
import { fetchUserData } from "../api/userService";

const Calendario = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleCalendarAuth, setGoogleCalendarAuth] = useState(false);
  const [userData, setUserData] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    fetchUserData()
      .then((data) => {
        setUserData(data);
        reset({
          full_name: data.full_name,
          username: data.username,
          email: data.email,
        });
      })
      .catch((err) => console.error("Erro ao buscar dados do usuário:", err))
      .finally(() => setIsLoading(false));
  }, [reset]);

  // Client ID específico para Calendar COM SCOPES
  const calendarClientId = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID;

  // Verificar se já está autenticado com Google Calendar
  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    const hasCalendarAuth = localStorage.getItem('google_calendar_authenticated');
    
    setGoogleCalendarAuth(!!(token && hasCalendarAuth));
    
    if (token && hasCalendarAuth) {
      loadEvents();
    }
  }, []);

  // Função para carregar eventos
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchGoogleCalendarEventsDirect();
      setEvents(data.items || []);
      toastService.success("Sucesso", "Eventos carregados com sucesso!");
    } catch (error) {
      console.error("❌ Falha ao carregar eventos:", error);
      
      if (error.response?.status === 401) {
        // Token expirado ou sem permissão
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_calendar_authenticated');
        setGoogleCalendarAuth(false);
        toastService.error("Sessão expirada", "Conecte novamente com Google Calendar");
      } else {
        toastService.error("Erro", "Não foi possível carregar os eventos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCalendarSuccess = async (response) => {
    try {
      console.log('🔑 Resposta do Google:', response);
      
      const token = response.access_token || response.credential;
      
      if (!token) {
        throw new Error("Token não recebido do Google");
      }
      
      // Salvar token do Google para Calendar
      localStorage.setItem('google_access_token', token);
      localStorage.setItem('google_calendar_authenticated', 'true');
      localStorage.setItem('google_token_type', response.token_type || 'Bearer');
      
      setGoogleCalendarAuth(true);
      toastService.success("Google Calendar", "Calendário conectado com sucesso!");
      
      // Carregar eventos automaticamente
      await loadEvents();
    } catch (err) {
      console.error("❌ Erro ao conectar Google Calendar:", err);
      toastService.error("Erro Google", "Não foi possível conectar com Google Calendar.");
    }
  };

  const handleGoogleCalendarLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_calendar_authenticated');
    localStorage.removeItem('google_token_type');
    setGoogleCalendarAuth(false);
    setEvents([]);
    toastService.success("Google Calendar", "Calendário desconectado!");
  };

  // ✅ USUÁRIO ESTÁ LOGADO - MOSTRAR CALENDÁRIO
  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📅 Meu Calendário</h2>
        <div className="text-muted">
          Logado como: <strong>{userData?.email || userData?.full_name || 'Usuário'}</strong>
        </div>
      </div>
      
      {!googleCalendarAuth ? (
        <div className="google-login-container">
          <div className="card">
            <div className="card-body text-center">
              <h4>Conectar Google Calendar</h4>
              <p className="text-muted mb-4">
                Olá <strong>{userData?.username || 'Usuário'}</strong>! 
                Conecte seu Google Calendar para visualizar seus eventos.
              </p>
              
              <GoogleOAuthProvider clientId={calendarClientId}>
                <div className="google-login-button">
                  <GoogleLogin
                    onSuccess={handleGoogleCalendarSuccess}
                    onError={() => toastService.error("Erro Google", "Não foi possível conectar com Google Calendar.")}
                    useOneTap={false}
                    scope="https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly"
                    theme="filled_blue"
                    size="large"
                    text="continue_with"
                  />
                </div>
              </GoogleOAuthProvider>
              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  🔐 Você já está logado no sistema. Esta conexão é apenas para 
                  acessar seus eventos do Google Calendar.
                </small>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Seus Eventos do Google Calendar</h3>
              <small className="text-muted">
                Conectado como: {userData?.email || 'Usuário Google'}
              </small>
            </div>
            <button onClick={handleGoogleCalendarLogout} className="btn btn-outline-danger btn-sm">
              Desconectar Google Calendar
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2">📥 Carregando seus eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="alert alert-info">
              <p>📭 Nenhum evento encontrado no seu calendário.</p>
              <small className="text-muted">
                Os eventos dos próximos 30 dias serão exibidos aqui.
              </small>
            </div>
          ) : (
            <div className="events-list">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Próximos Eventos ({events.length})</h5>
                <small className="text-muted">
                  Atualizado em: {new Date().toLocaleDateString()}
                </small>
              </div>
              
              {events.map((event) => (
                <div key={event.id} className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title">{event.summary || 'Evento sem título'}</h5>
                    <p className="card-text">
                      <strong>📅 Data:</strong> {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                    </p>
                    {event.description && (
                      <p className="card-text"><small>{event.description}</small></p>
                    )}
                    {event.location && (
                      <p className="card-text">
                        <strong>📍 Local:</strong> {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendario;