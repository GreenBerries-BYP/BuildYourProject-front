// Calendario.jsx - COMPONENTE CORRIGIDO
import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { fetchGoogleCalendarEventsDirect } from "../api/api";
import { useAuthContext } from "../auth/authContext";
import toastService from "../api/toastService";

const Calendario = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleCalendarAuth, setGoogleCalendarAuth] = useState(false);
  const { isLoggedIn } = useAuthContext();

  // Client ID específico para Calendar COM SCOPES
  const calendarClientId = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID;

  // Verificar se já está autenticado
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

  // ✅ CALLBACK CORRETO PARA GOOGLE CALENDAR
  const handleGoogleCalendarSuccess = async (response) => {
    try {
      console.log('🔑 Resposta do Google:', response);
      
      // ✅ USAR access_token, não credential
      const token = response.access_token || response.credential;
      
      if (!token) {
        throw new Error("Token não recebido do Google");
      }
      
      // ✅ SALVAR TOKEN CORRETAMENTE
      localStorage.setItem('google_access_token', token);
      localStorage.setItem('google_calendar_authenticated', 'true');
      localStorage.setItem('google_token_type', response.token_type || 'Bearer');
      
      setGoogleCalendarAuth(true);
      toastService.success("Google Calendar", "Calendário conectado com sucesso!");
      
      // ✅ CARREGAR EVENTOS
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

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
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
              
              {/* ✅ GOOGLE OAUTH COM SCOPES ESPECÍFICOS */}
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