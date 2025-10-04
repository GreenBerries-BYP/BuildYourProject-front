import { useState, useRef, useEffect } from "react";
import "../styles/ModalNewProject.css";
import { useTranslation } from "react-i18next";
import toastService from "../api/toastService";
import { assignTaskToUser, fetchProjectCollaborators } from "../api/api";

const ModalAssignTask = ({ isOpen, onClose, taskId, project, onAssignSuccess }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [selectedCollaborator, setSelectedCollaborator] = useState("");
  const [collaboratorError, setCollaboratorError] = useState("");
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);

  // Resetar estados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedCollaborator("");
      setCollaboratorError("");
      
      // Buscar colaboradores do projeto quando o modal abrir
      if (project?.id) {
        fetchCollaborators(project.id);
      }
    }
  }, [isOpen, project]);

  // Função para buscar colaboradores do projeto
  const fetchCollaborators = async (projectId) => {
    setLoadingCollaborators(true);
    try {
      const collaboratorsData = await fetchProjectCollaborators(projectId);
      console.log('Colaboradores carregados:', collaboratorsData); // DEBUG
      setCollaborators(collaboratorsData || []);
    } catch (err) {
      console.error('Erro ao buscar colaboradores:', err);
      toastService.error(
        t("toast.errorTitle") || "Erro",
        t("toast.fetchCollaboratorsError") || "Erro ao carregar colaboradores"
      );
      setCollaborators([]);
    } finally {
      setLoadingCollaborators(false);
    }
  };

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
      collab => collab.id.toString() === selectedCollaborator
    );

    if (!selectedCollaboratorData) {
      setCollaboratorError(t("messages.collaboratorNotFound") || "Colaborador não encontrado");
      return;
    }

    setLoading(true);
    try {
      const response = await assignTaskToUser(taskId, selectedCollaboratorData.id);
      
      toastService.success(
        t("toast.assignTaskSuccessTitle"),
        t("toast.assignTaskSuccessDetail")
      );

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

  // DEBUG: Mostrar informações no console
  console.log('Collaborators state:', collaborators);
  console.log('Loading collaborators:', loadingCollaborators);
  console.log('Project:', project);

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
            
            {loadingCollaborators ? (
              <div className="loading-collaborators">
                {t("messages.loadingCollaborators") || "Carregando colaboradores..."}
              </div>
            ) : (
              <select
                id="collaboratorSelect"
                value={selectedCollaborator}
                onChange={handleCollaboratorSelect}
                onKeyDown={handleKeyDown}
                className="collaborator-select"
              >
                <option value="">
                  {collaborators.length === 0 
                    ? (t("placeholders.noCollaborators") || "-- Nenhum colaborador disponível --")
                    : (t("placeholders.selectCollaborator") || "-- Selecione um colaborador --")
                  }
                </option>
                {collaborators.map((collaborator) => (
                  <option 
                    key={collaborator.id} 
                    value={collaborator.id.toString()}
                  >
                    {collaborator.full_name || collaborator.name || collaborator.email} 
                    {collaborator.email && collaborator.full_name && ` (${collaborator.email})`}
                  </option>
                ))}
              </select>
            )}
            
            {collaboratorError && <p className="input-error">{collaboratorError}</p>}
            
            {/* Mostrar informações de debug */}
            {!loadingCollaborators && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {collaborators.length} colaborador(es) encontrado(s)
              </div>
            )}
          </div>

          <div className="navigation-buttons">
            <button
              type="button"
              className="save-btn"
              onClick={handleAssign}
              disabled={loading || !selectedCollaborator || loadingCollaborators || collaborators.length === 0}
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
