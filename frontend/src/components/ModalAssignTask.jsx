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
  onAssignSuccess, 
  collaborators: initialCollaborators = [] 
}) => {
  const modalRef = useRef();
  const { t } = useTranslation();

  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [selectedUserId, setSelectedUserId] = useState(""); // Mudado para selectedUserId
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Resetar ao abrir/fechar modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId("");
      setFormErrors({});
    }
    setCollaborators(initialCollaborators);
  }, [isOpen, initialCollaborators]);

  // Função para extrair o ID do colaborador
  const getCollaboratorId = (collab) => {
    if (typeof collab === 'object') {
      return collab.id; // SEMPRE use o ID numérico
    }
    return collab;
  };

  // Função para extrair o nome para exibição
  const getCollaboratorDisplayName = (collab) => {
    if (typeof collab === 'object') {
      return collab.full_name || collab.name || collab.email || 'Unknown';
    }
    return collab;
  };

  // Função para extrair email
  const getCollaboratorEmail = (collab) => {
    if (typeof collab === 'object') {
      return collab.email;
    }
    return null;
  };

  // Submissão corrigida
  const handleAssign = async (e) => {
    e.preventDefault();
    
    // Validação
    if (!selectedUserId) {
      setFormErrors({ user: t("messages.selectCollaborator") });
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      console.log("Atribuindo tarefa:", { 
        taskId, 
        selectedUserId,
        collaborators: collaborators.map(c => ({ id: c.id, name: c.full_name, email: c.email }))
      });
      
      // Chama a função de atribuição
      const response = await assignTaskToUser(taskId, selectedUserId);
      
      console.log("Resposta da API:", response);
      
      // Encontra o colaborador selecionado para passar os dados completos
      const selectedCollaborator = collaborators.find(collab => 
        getCollaboratorId(collab) === parseInt(selectedUserId) || 
        getCollaboratorId(collab) === selectedUserId
      );
      
      console.log("Colaborador encontrado:", selectedCollaborator);
      
      // Chama o callback de sucesso
      if (onAssignSuccess) {
        onAssignSuccess(selectedCollaborator || { 
          id: selectedUserId,
          full_name: 'Unknown',
          email: 'unknown@email.com'
        });
      }
      
      // Fecha o modal
      onClose();
      
    } catch (err) {
      console.error("Erro detalhado ao atribuir tarefa:", err);
      console.error("Response data:", err.response?.data);
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || t("messages.errorAssignTask");
      
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
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setFormErrors({});
                }}
              >
                <option value="">{t("messages.selectOption")}</option>
                {collaborators.map((collab, index) => {
                  const collabId = getCollaboratorId(collab);
                  const displayName = getCollaboratorDisplayName(collab);
                  const email = getCollaboratorEmail(collab);
                  
                  return (
                    <option key={collabId || index} value={collabId}>
                      {displayName}
                      {email ? ` (${email})` : ''}
                    </option>
                  );
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