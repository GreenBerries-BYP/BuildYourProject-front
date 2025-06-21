import React from 'react';

function ConnectGoogleCalendar({ onSuccess }) {
  const handleConnect = () => {
    // Redireciona o navegador para o backend que inicia o OAuth do Google Calendar
    window.location.href = 'http://localhost:8000/api/google-calendar/init/';
  };

  return (
    <button onClick={handleConnect}>
      Conectar com Google Calendar
    </button>
  );
}

export default ConnectGoogleCalendar;
