import React from "react";
import {
  FaCalendarAlt,
  FaUserPlus,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../styles/Home.css";
import "../styles/Notifications.css";

const iconMap = {
  meeting: <FaCalendarAlt className="notification-icon meeting" />,
  new_member: <FaUserPlus className="notification-icon new-member" />,
  task_completed: (
    <FaCheckCircle className="notification-icon task-completed" />
  ),
  deadline: <FaExclamationTriangle className="notification-icon deadline" />,
  default: <FaCheckCircle className="notification-icon" />,
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const { id, type, title, description, project, timestamp, isRead } =
    notification;
  const icon = iconMap[type] || iconMap.default;

  return (
    <div
      className={`notification-item ${isRead ? "read" : "unread"} d-flex align-items-center`}
      onClick={() => onMarkAsRead(id)}
    >
      <div className="notification-icon-container">
        {icon}
        {!isRead && <div className="unread-dot"></div>}
      </div>
      <div className="notification-content">
        <p className="notification-title">{title}</p>
        <p className="notification-description">{description}</p>
        <p className="notification-project">{project}</p>
      </div>
      <div className="notification-timestamp">
        <span>{timestamp}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
