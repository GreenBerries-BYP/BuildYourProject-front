import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { fetchGoogleCalendarEvents } from "../api/api";
import { saveToken, getToken, getGoogleLoginStatus } from "../auth/auth";
import toastService from "../api/toastService";

const Calendario = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleLogged, setGoogleLogged] = useState(getGoogleLoginStatus());

  // Função para carregar eventos
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchGoogleCalendarEvents();
      setEvents(data);
    } catch (error) {
      console.error("Falha ao carregar eventos:", error);
      toastService.error("Erro", "Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  };

  // Se estiver logado com Google, carrega eventos
  useEffect(() => {
    if (googleLogged) {
      loadEvents();
    }
  }, [googleLogged]);

  // Callback quando login com Google for bem-sucedido
  const handleGoogleSuccess = async (response) => {
    try {
      const token = response.credential;
      // Salva token no localStorage para autorizar requests futuras
      saveToken(token, true, token); // terceiro parâmetro pode ser refreshToken se tiver
      setGoogleLogged(true);
      toastService.success("Login Google", "Login com Google realizado!");
    } catch (err) {
      console.error("Erro login Google:", err);
      toastService.error("Erro Google", "Não foi possível logar com Google.");
    }
  };

  return (
    <div className="container">
      {!googleLogged ? (
        <div className="google-login-container">
          <h2>Login com Google para acessar seu calendário</h2>
          <div className="google-login-button">

            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                toastService.error(
                    "Erro Google",
                    "Não foi possível autenticar com Google."
                )
                }
                useOneTap={false}
                scope="openid email profile https://www.googleapis.com/auth/calendar"
            />
          </div>
        </div>
      ) : (
        <div>
          <h2>Seus eventos do Google Calendar</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : events.length === 0 ? (
            <p>Nenhum evento encontrado.</p>
          ) : (
            <ul>
              {events.map((event) => (
                <li key={event.id}>
                  <strong>{event.summary}</strong> -{" "}
                  {event.start.dateTime || event.start.date}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendario;
