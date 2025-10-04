import React, { useEffect, useState } from "react";
import { useAuthContext } from "../auth/authContext";
import toastService from "../api/toastService";
import { useForm, Controller } from "react-hook-form";
import { fetchUserData } from "../api/userService";
import { fetchGoogleCalendarEventsDirect } from "../api/api";
import "../styles/Calendario.css"
import { MdOutlineCalendarMonth} from "react-icons/md";


const Calendario = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleCalendarAuth, setGoogleCalendarAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Client ID específico para Calendar
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

  // ✅ CORREÇÃO: Usar redirecionamento direto (sem popup)
  const handleGoogleCalendarConnect = () => {
    if (!calendarClientId) {
      toastService.error("Erro", "Client ID do Google não configurado.");
      return;
    }

    const scope = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';
    const redirectUri = window.location.origin + window.location.pathname; // ✅ Mesma página
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(calendarClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(scope)}&` +
      `include_granted_scopes=true&` +
      `state=calendar_auth&` +
      `prompt=consent`;

    // ✅ REDIRECIONAMENTO DIRETO (sem popup)
    window.location.href = authUrl;
  };

  // ✅ VERIFICAR TOKEN NA URL (quando retorna do Google)
  useEffect(() => {
    const hash = window.location.hash;
    console.log('Hash da URL:', hash);
    
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const error = params.get('error');
      
      if (error) {
        console.error('Erro do Google:', error);
        toastService.error("Erro Google", "Falha na autenticação: " + error);
        return;
      }
      
      if (accessToken) {
        console.log('Access Token encontrado na URL:', accessToken);
        handleGoogleTokenReceived(accessToken);
        
        // ✅ LIMPAR URL COMPLETAMENTE (sem hash)
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    }
  }, []);

  // ✅ PROCESSAR TOKEN RECEBIDO
  const handleGoogleTokenReceived = async (accessToken) => {
    try {
      console.log('Token do Google recebido:', accessToken);
      
      // Salvar token do Google para Calendar
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_calendar_authenticated', 'true');
      
      setGoogleCalendarAuth(true);
      toastService.success("Google Calendar", "Calendário conectado com sucesso!");
      
      // Carregar eventos automaticamente
      await loadEvents();
    } catch (err) {
      console.error("Erro ao processar token do Google:", err);
      toastService.error("Erro Google", "Não foi possível conectar com Google Calendar.");
    }
  };

  // Função para carregar eventos
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchGoogleCalendarEventsDirect();
      setEvents(data.items || []);
      toastService.success("Sucesso", "Eventos carregados com sucesso!");
    } catch (error) {
      console.error("Falha ao carregar eventos:", error);
      
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

  const handleGoogleCalendarLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_calendar_authenticated');
    setGoogleCalendarAuth(false);
    setEvents([]);
    toastService.success("Google Calendar", "Calendário desconectado!");
  };

  if (isLoading) {
    return (
      <div className="container text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="calendar-container container">
      <div className="conectar d-flex justify-content-between align-items-center mb-4">
        <h2>
          <MdOutlineCalendarMonth /> Meu Calendário
        </h2>
        <div className="conectar-text">
          Logado como: <strong>{userData?.email || userData?.full_name || 'Usuário'}</strong>
        </div>
      </div>
      
      {!googleCalendarAuth ? (
        <div className="google-login-container">
          <div className="conectar card">
            <div className="conectar-text card-body text-center">
              <h4>Conectar Google Calendar</h4>
              <p className=" mb-4">
                Olá <strong>{userData?.username || 'Usuário'}</strong>! 
                Conecte seu Google Calendar para visualizar seus eventos.
              </p>
              
              <button
                onClick={handleGoogleCalendarConnect}
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 mx-auto"
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    Conectando...
                  </>
                ) : (
                  <>
                    <span>Conectar Google Calendar</span>
                  </>
                )}
              </button>

              <div className="mt-4 p-3">
                <small className="aviso">
                  Você será redirecionado para o Google para conceder permissões.
                </small>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="eventos">
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
              <p className="mt-2">Carregando seus eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="alert alert-info">
              <p>Nenhum evento encontrado no seu calendário.</p>
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
                      <strong>Data:</strong> {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                    </p>
                    {event.description && (
                      <p className="card-text"><small>{event.description}</small></p>
                    )}
                    {event.location && (
                      <p className="card-text">
                        <strong>Local:</strong> {event.location}
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