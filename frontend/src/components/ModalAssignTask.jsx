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
  projectName,
  collaborators: initialCollaborators = [] 
}) => {
  const modalRef = useRef();
  const { t } = useTranslation();


  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [selectedUserId, setSelectedUserId] = useState(""); // ← Mudei para selectedUserId
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Resetar campos ao abrir/fechar modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId("");
      setFormErrors({});
    }
    setCollaborators(initialCollaborators);
  }, [isOpen, initialCollaborators]);
 
  // Submissão - CORRIGIDA
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setFormErrors({ user: t("messages.selectCollaborator") });
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      console.log("Debug - Atribuindo tarefa:", {
        taskId,
        selectedUserId, // ← Agora é o ID
        selectedUserIdType: typeof selectedUserId, // ← Verifica o tipo
        projectId
      });

      const result = await assignTaskToUser(taskId, selectedUserId);
      
      console.log("✅ Tarefa atribuída com sucesso:", result);
      
      if (onAssigned) onAssigned(result);
      onClose();
    } catch (err) {
      console.error("Erro detalhado ao atribuir tarefa:", err);
      
      let errorMessage = t("messages.errorAssignTask");
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setFormErrors({ submit: errorMessage });
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
                value={selectedUserId} // ← Agora usa selectedUserId
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">{t("messages.selectOption")}</option>
                {collaborators.map((collab, index) => {
                  // Para objetos User do Django - GARANTIR que usa ID
                  if (typeof collab === 'object' && collab.id) {
                    return (
                      <option key={collab.id} value={collab.id}> {/* ← VALUE é o ID */}
                        {collab.full_name || collab.name || collab.email} 
                        {collab.email ? ` (${collab.email})` : ''}
                      </option>
                    );
                  } else if (typeof collab === 'object' && !collab.id) {
                    // Se for objeto mas não tem ID, usar índice como fallback
                    console.warn('Colaborador sem ID:', collab);
                    return (
                      <option key={index} value={index}>
                        {collab.full_name || collab.name || collab.email || 'Usuário sem nome'}
                      </option>
                    );
                  } else {
                    // Se for string (formato antigo) - converter para ID se possível
                    return (
                      <option key={index} value={index}> {/* ← Usa índice como ID temporário */}
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