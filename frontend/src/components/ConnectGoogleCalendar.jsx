function ConnectGoogleCalendar() {
  const handleConnect = () => {
    window.location.href = 'http://localhost:8000/api/google-calendar/init/';
  };

  return (
    <button onClick={handleConnect}>
      Conectar com Google Calendar
    </button>
  );
}

export default ConnectGoogleCalendar;
