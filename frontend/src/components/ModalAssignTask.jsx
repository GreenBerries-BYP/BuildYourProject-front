import { useEffect, useRef, useState } from "react";
import "../styles/ModalAssignTask.css";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import { getToken } from "../auth/auth";
import { assignTaskToUser } from "../api/api";

const ModalAssignTask = ({ 
  isOpen, 
  onClose, 
  taskId, 
  projectId, 
  onAssigned, 
  collaborators: initialCollaborators = [] 
}) => {
  const modalRef = useRef();
  const { t } = useTranslation();

  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});



  // Submissão
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setFormErrors({ user: t("messages.selectCollaborator") });
      return;
    }

    setLoading(true);
    try {
      await assignTaskToUser(taskId, selectedUser);
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      console.error("Erro ao atribuir tarefa:", err);
      setFormErrors({ submit: err.message || t("messages.errorAssignTask") });
    } finally {
      setLoading(false);
    }
  };

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Fechar clicando fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{t("titles.assignTask")}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleAssign}>
            <div className="input-group">
              <label>{t("inputs.selectCollaborator")}</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">{t("messages.selectOption")}</option>
                {collaborators.map((collab, index) => {
                  // Verifica se é um objeto com propriedades ou apenas uma string
                  if (typeof collab === 'object') {
                    return (
                      <option key={collab.id || index} value={collab.id || collab.email}>
                        {collab.full_name || collab.name || collab.email} 
                        {collab.email ? ` (${collab.email})` : ''}
                      </option>
                    );
                  } else {
                    // Se for apenas uma string (como no ModalNewTask)
                    return (
                      <option key={index} value={collab}>
                        {collab}
                      </option>
                    );
                  }
                })}
              </select>
              {formErrors.user && (
                <p className="input-error">{formErrors.user}</p>
              )}
            </div>

            {formErrors.submit && (
              <p className="input-error center">{formErrors.submit}</p>
            )}

            <div className="save-wrapper">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? t("buttons.saving") : t("buttons.assign")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAssignTask;
