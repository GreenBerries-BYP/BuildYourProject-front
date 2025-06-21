import React, { useState, useEffect } from 'react';
import ConnectGoogleCalendar from "../components/ConnectGoogleCalendar";
import { fetchUserData } from '../api/userService';

async function fetchGoogleCalendarEvents() {
  const response = await fetch('http://localhost:8000/api/google-calendar/events/', {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Erro ao buscar eventos do Google Calendar');
  return response.json();
}

function Calendario() {
  const [userData, setUserData] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
  async function loadUserAndCheckConnection() {
    try {
      const userData = await fetchUserData();
      setUserData(userData);

      console.log('Buscando is-connected...');
      const res = await fetch('http://localhost:8000/api/google-calendar/is-connected/', {
        credentials: 'include',
      });

      console.log('Status da resposta:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Resposta JSON:', data);

        if (data.connected) {
          console.log('Usuário está conectado ao Google Calendar');
          setIsConnected(true);
          loadEvents();
        } else {
          console.log('Usuário NÃO está conectado');
          setIsConnected(false);
        }
      } else {
        console.error('Erro HTTP:', res.status);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Erro ao carregar estado de conexão:', error);
      setIsConnected(false);
    }
  }

  loadUserAndCheckConnection();
}, []);


  async function loadEvents() {
    try {
      const calendarEvents = await fetchGoogleCalendarEvents();
      console.log('Eventos carregados:', calendarEvents);
      setEvents(calendarEvents.items || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  }

  return (
    <div>
      {isConnected === null ? (
        <p>Carregando estado de conexão...</p>
      ) : !isConnected ? (
        <ConnectGoogleCalendar onSuccess={() => {
          console.log('Usuário conectou com sucesso');
          setIsConnected(true);
          loadEvents();
        }} />
      ) : (
        <div>
          <h2>Eventos do seu Google Calendar</h2>
          {events.length === 0 ? (
            <p>Nenhum evento encontrado.</p>
          ) : (
            <ul>
              {events.map(event => (
                <li key={event.id}>
                  <strong>{event.summary}</strong> - {event.start.dateTime || event.start.date}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Calendario;
