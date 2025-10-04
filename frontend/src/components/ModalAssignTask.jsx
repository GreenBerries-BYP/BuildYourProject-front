import { useState, useRef, useEffect } from "react";
import "../styles/ModalNewProject.css";
import { useTranslation } from "react-i18next";
import toastService from "../api/toastService";
import { assignTaskToUser } from "../api/api"; // Importe a função da API

const ModalAssignTask = ({ isOpen, onClose, taskId, project, onAssignSuccess }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [selectedCollaborator, setSelectedCollaborator] = useState("");
  const [collaboratorError, setCollaboratorError] = useState("");
  const [loading, setLoading] = useState(false);

  // Extrai os colaboradores do projeto
  const collaborators = project?.collaborators || [];

  // Resetar estados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedCollaborator("");
      setCollaboratorError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAssign();
    }
  };

  const handleCollaboratorSelect = (e) => {
    const collaboratorId = e.target.value;
    setSelectedCollaborator(collaboratorId);
    setCollaboratorError("");
  };

  const handleAssign = async () => {
    if (!selectedCollaborator) {
      setCollaboratorError(t("messages.selectCollaborator") || "Selecione um colaborador");
      return;
    }

    // Encontrar o colaborador selecionado
    const selectedCollaboratorData = collaborators.find(
      collab => collab?.id.toString() === selectedCollaborator
    );

    if (!selectedCollaboratorData) {
      setCollaboratorError(t("messages.collaboratorNotFound") || "Colaborador não encontrado");
      return;
    }

    setLoading(true);
    try {
      // 🔥 AGORA USA A API REAL
      const response = await assignTaskToUser(taskId, selectedCollaboratorData.id);

      toastService.success(
        t("toast.assignTaskSuccessTitle"),
        t("toast.assignTaskSuccessDetail")
      );

      // Passa os dados completos do colaborador para atualizar a UI
      onAssignSuccess(selectedCollaboratorData);
      setSelectedCollaborator("");
      onClose();
    } catch (err) {
      console.error('Erro ao atribuir tarefa:', err);
      const errorMessage = err.response?.data?.error || err.message || t("toast.assignTaskErrorDetail");

      toastService.error(
        t("toast.assignTaskErrorTitle"),
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{t("titles.assignTask")}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Seletor de colaboradores */}
          <div className="input-group">
            <label htmlFor="collaboratorSelect">
              {t("inputs.selectCollaborator") || "Selecionar colaborador"}
            </label>
            <select
              id="collaboratorSelect"
              value={selectedCollaborator}
              onChange={handleCollaboratorSelect}
              onKeyDown={handleKeyDown}
              className="collaborator-select"
            >
              <option value="">
                {t("placeholders.selectCollaborator") || "-- Selecione um colaborador --"}
              </option>
              {/* --- CÓDIGO CORRIGIDO AQUI --- */}
              {collaborators.map((collaboratorName, index) => (
                <option
                  key={index} // Usamos o index como chave, já que nomes podem se repetir
                  value={collaboratorName} // O valor da opção será o próprio nome do colaborador
                >
                  {collaboratorName} {/* O texto exibido é o nome do colaborador */}
                </option>
              ))}
            </select>
            {collaboratorError && <p className="input-error">{collaboratorError}</p>}
          </div>

          <div className="navigation-buttons">
            <button
              type="button"
              className="save-btn"
              onClick={handleAssign}
              disabled={loading || !selectedCollaborator}
            >
              {loading ? t("buttons.saving") : t("buttons.assign")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAssignTask;