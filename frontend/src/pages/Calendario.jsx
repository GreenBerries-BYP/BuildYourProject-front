import React, { useEffect, useState } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { fetchGoogleCalendarEvents } from "../api/api";
import { 
  saveGoogleToken, 
  getGoogleToken, 
  isGoogleCalendarAuthenticated,
  getGoogleCalendarStatus 
} from "../auth/auth";
import { useAuthContext } from "../auth/authContext";
import toastService from "../api/toastService";

const Calendario = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleCalendarAuth, setGoogleCalendarAuth] = useState(isGoogleCalendarAuthenticated());
  const { user, isLoggedIn } = useAuthContext();

  // Verificar se já está autenticado com Google (via login principal)
  useEffect(() => {
    const checkGoogleAuth = () => {
      const status = getGoogleCalendarStatus();
      setGoogleCalendarAuth(status.isAuthenticated);
      
      // Se já está autenticado com Google, carrega eventos automaticamente
      if (status.isAuthenticated && status.accessToken) {
        loadEvents(status.accessToken);
      }
    };

    checkGoogleAuth();
  }, []);

  // Função para carregar eventos
  const loadEvents = async (googleToken = null) => {
    setLoading(true);
    try {
      const token = googleToken || getGoogleToken();
      
      if (!token) {
        throw new Error("Token do Google não encontrado");
      }
      
      const data = await fetchGoogleCalendarEvents(token);
      setEvents(data.items || []);
      toastService.success("Sucesso", "Eventos carregados com sucesso!");
    } catch (error) {
      console.error("Falha ao carregar eventos:", error);
      toastService.error("Erro", "Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  };

  // Callback quando login com Google for bem-sucedido (APENAS para Calendar)
  const handleGoogleCalendarSuccess = async (response) => {
    try {
      const token = response.access_token || response.credential;
      
      if (!token) {
        throw new Error("Token não recebido do Google");
      }
      
      // Salva token do Google especificamente para Calendar
      saveGoogleToken(token);
      localStorage.setItem('google_calendar_authenticated', 'true');
      localStorage.setItem('google_access_token', token);
      
      setGoogleCalendarAuth(true);
      toastService.success("Google Calendar", "Calendário conectado com sucesso!");
      
      // Carrega eventos automaticamente
      await loadEvents(token);
    } catch (err) {
      console.error("Erro ao conectar Google Calendar:", err);
      toastService.error("Erro Google", "Não foi possível conectar com Google Calendar.");
    }
  };

  const handleGoogleCalendarLogout = () => {
    googleLogout();
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_calendar_authenticated');
    setGoogleCalendarAuth(false);
    setEvents([]);
    toastService.success("Google Calendar", "Calendário desconectado!");
  };

  // 🔒 Só mostra o componente se usuário estiver logado no sistema
  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="alert alert-warning">
          <h3>🔒 Acesso Restrito</h3>
          <p>Você precisa fazer login para acessar o calendário.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>📅 Meu Calendário</h2>
      
      {!googleCalendarAuth ? (
        <div className="google-login-container">
          <div className="card">
            <div className="card-body text-center">
              <h4>Conectar Google Calendar</h4>
              <p>Para visualizar seus eventos, conecte com sua conta Google</p>
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
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Seus Eventos do Google Calendar</h3>
            <button onClick={handleGoogleCalendarLogout} className="btn btn-outline-danger btn-sm">
              Desconectar Google Calendar
            </button>
          </div>
          
          {loading ? (
            <div className="text-center">
              <p>📥 Carregando seus eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="alert alert-info">
              <p>📭 Nenhum evento encontrado no seu calendário.</p>
            </div>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="card mb-2">
                  <div className="card-body">
                    <h5 className="card-title">{event.summary || 'Evento sem título'}</h5>
                    <p className="card-text">
                      <strong>📅 Data:</strong> {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                    </p>
                    {event.description && (
                      <p className="card-text"><small>{event.description}</small></p>
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