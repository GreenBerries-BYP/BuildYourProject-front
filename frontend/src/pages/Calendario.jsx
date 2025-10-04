import React, { useEffect, useState } from "react";
import { useAuthContext } from "../auth/authContext";
import toastService from "../api/toastService";
import { useForm, Controller } from "react-hook-form";
import { fetchUserData } from "../api/userService";
import { fetchGoogleCalendarEventsDirect } from "../api/api";
import ModalNewCalendarEvent from "../components/ModalNewCalendarEvent";
import "../styles/Calendario.css"
import { MdOutlineCalendarMonth } from "react-icons/md";
import { useTranslation } from "react-i18next";

const Calendario = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleCalendarAuth, setGoogleCalendarAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

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

  const calendarClientId = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID;

  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    const hasCalendarAuth = localStorage.getItem('google_calendar_authenticated');
    
    setGoogleCalendarAuth(!!(token && hasCalendarAuth));
    
    if (token && hasCalendarAuth) {
      loadEvents();
    }
  }, []);

  const handleGoogleCalendarConnect = () => {
    if (!calendarClientId) {
      toastService.error("Erro", t("calendar.googleConfigError"));
      return;
    }

    const scope = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';
    const redirectUri = window.location.origin + window.location.pathname;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(calendarClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(scope)}&` +
      `include_granted_scopes=true&` +
      `state=calendar_auth`;

    window.location.href = authUrl;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        handleGoogleTokenReceived(accessToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleGoogleTokenReceived = async (accessToken) => {
    try {
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_calendar_authenticated', 'true');
      
      setGoogleCalendarAuth(true);
      toastService.success("Google Calendar", t("calendar.calendarConnected"));
      
      await loadEvents();
    } catch (err) {
      console.error("Erro ao processar token do Google:", err);
      toastService.error("Erro Google", t("calendar.tokenError"));
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchGoogleCalendarEventsDirect();
      setEvents(data.items || []);
    } catch (error) {
      console.error("Falha ao carregar eventos:", error);
      toastService.error("Erro", t("calendar.loadEventsError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    toastService.success("Sucesso", t("calendar.eventCreated"));
    loadEvents();
  };

  const handleGoogleCalendarLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_calendar_authenticated');
    setGoogleCalendarAuth(false);
    setEvents([]);
    toastService.success("Google Calendar", t("calendar.calendarDisconnected"));
  };

  if (isLoading) {
    return (
      <div className="container text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("calendar.loading")}</span>
        </div>
        <p className="mt-2">{t("calendar.loading")}</p>
      </div>
    );
  }

  return (
    <div className="calendar-container container">
      <div className="conectar d-flex justify-content-between align-items-center mb-4">
        <h2>
          <MdOutlineCalendarMonth />
          &nbsp;{t("calendar.title")}
        </h2>
        <div className="conectar-text">
          {t("calendar.loggedInAs")} <strong>{userData?.email || userData?.full_name || t("messages.userProfile")}</strong>
        </div>
      </div>
      
      {!googleCalendarAuth ? (
        <div className="google-login-container">
          <div className="conectar card">
            <div className="conectar-text card-body text-center">
              <h4>
                <MdOutlineCalendarMonth />
                &nbsp;{t("calendar.connectTitle")}
              </h4>
              <p className=" mb-4">
                {t("calendar.helloUser")} <strong>{userData?.username || t("messages.userProfile")}</strong>! 
                {t("calendar.connectDescription")}
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
                    {t("calendar.connecting")}
                  </>
                ) : (
                  <>
                    <span>{t("calendar.connectButton")}</span>
                  </>
                )}
              </button>

              <div className="mt-4 p-3">
                <small className="aviso">
                  {t("calendar.connectionNotice")}
                </small>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="eventos">
            <div>
              <h3>{t("calendar.eventsTitle")}</h3>
              <small className="info-small">
                {t("calendar.connectedAs")} {userData?.email || t("messages.userProfile")}
              </small>
            </div>
            <div className="d-flex gap-2 btn-container">
              <button 
                onClick={() => setModalAberto(true)}
                className="btn-calendar btn btn-success"
              >
                + {t("calendar.newEvent")}
              </button>
              <button onClick={handleGoogleCalendarLogout} className="btn-calendar btn btn-outline-danger">
                {t("calendar.disconnect")}
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("calendar.loading")}</span>
              </div>
              <p className="mt-2">{t("calendar.loadingEvents")}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="alert alert-info text-center">
              <h5>{t("calendar.noEventsTitle")}</h5>
              <p>{t("calendar.noEventsMessage")}</p>
              <small className="info-small">
                {t("calendar.noEventsHint")}
              </small>
              <div className="mt-3">
                <button 
                  onClick={() => setModalAberto(true)}
                  className="btn btn-outline-primary btn-sm"
                >
                  + {t("calendar.newEvent")}
                </button>
              </div>
            </div>
          ) : (
            <div className="events-list">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>{t("calendar.upcomingEvents")} ({events.length})</h5>
                <small className="info-small">
                  {t("calendar.updatedOn")} {new Date().toLocaleDateString()}
                </small>
              </div>
              
              {events.map((event) => (
                <div key={event.id} className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title">{event.summary || t("calendar.eventNoTitle")}</h5>
                    <p className="card-text">
                      <strong>{t("calendar.eventDate")}</strong> {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                    </p>
                    {event.description && (
                      <p className="card-text"><small>{event.description}</small></p>
                    )}
                    {event.location && (
                      <p className="card-text">
                        <strong>{t("calendar.eventLocation")}</strong> {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ModalNewCalendarEvent
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Calendario;