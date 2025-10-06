import React, { useState, useEffect } from 'react';
import NotificationItem from './NotificationItem';
import '../styles/Notifications.css';
import '../styles/Home.css';

// mock de notificações
const mockNotifications = [
  { id: 1, type: 'meeting', title: 'Daily-Meeting', description: 'Sua reunião começará em 15 minutos.', project: 'Projeto A', timestamp: '1h atrás', isRead: false },
  { id: 2, type: 'new_member', title: 'Novo integrante!', description: 'Parabéns! Seu projeto tem um novo integrante.', project: 'Projeto B', timestamp: '2h atrás', isRead: false },
  { id: 3, type: 'task_completed', title: 'Tarefa Concluída', description: 'A tarefa "Criar wireframe" foi concluída.', project: 'Projeto A', timestamp: '5h atrás', isRead: true },
  { id: 4, type: 'deadline', title: 'Prazo se aproximando', description: 'A tarefa "Testes de usabilidade" vence amanhã.', project: 'Projeto C', timestamp: '1d atrás', isRead: true },
];

const Notifications = ({ isOpen }) => {
  const [activeTab, setActiveTab] = useState('todas');
  const [notifications, setNotifications] = useState(mockNotifications);

  // lógica para buscar notificações da API quando tiver o back
  /*
  useEffect(() => {
    const fetchNotifications = async () => {
      // const data = await suaApi.get('/notifications');
      // setNotifications(data);
    };

    fetchNotifications();
  }, []);
  */

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    // chamada p api marcar 1 como lida
    // ex: api.post(`/notifications/${id}/read`);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    // chamada p api marcar todas como lidas
    // ex: api.post('/notifications/read-all');
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'nao-lidas') return !n.isRead;
    if (activeTab === 'lidas') return n.isRead;
    return true; // aba "todas"
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h4>Notificações</h4>
        <button onClick={handleMarkAllAsRead} className="mark-all-read-btn">Marcar todas como lidas</button>
      </div>
      <div className="notifications-tabs">
        <button onClick={() => setActiveTab('todas')} className={activeTab === 'todas' ? 'active' : ''}>Todas</button>
        <button onClick={() => setActiveTab('nao-lidas')} className={activeTab === 'nao-lidas' ? 'active' : ''}>Não lidas</button>
        <button onClick={() => setActiveTab('lidas')} className={activeTab === 'lidas' ? 'active' : ''}>Lidas</button>
      </div>
      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        ) : (
          <p className="no-notifications">Nenhuma notificação encontrada.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;