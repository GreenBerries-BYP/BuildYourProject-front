import { useEffect, useRef, useState } from "react";
import "../styles/ModalNewTask.css";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import { getToken } from "../auth/auth";
import { createGoogleCalendarEventFromTask } from "../api/api";

const ModalNewTask = ({ 
  isOpen, 
  onClose, 
  projetoId, 
  onTaskCreated, 
  collaborators: initialCollaborators = [], 
  nomeProjeto = "",
  isSubtask = false, 
  parentTaskId = null 
}) => {
  const modalRef = useRef();
  const { t } = useTranslation();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavel, setResponsavel] = useState(null);
  const [dataEntrega, setDataEntrega] = useState("");
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [creatingCalendarEvent, setCreatingCalendarEvent] = useState(false);

  // Validação do formulário
  const validateForm = () => {
    const errors = {};
    if (!nome.trim()) errors.nome = t("messages.taskNameRequired");
    if (!descricao.trim()) errors.descricao = t("messages.taskDescriptionRequired");
    if (!dataEntrega) errors.dataEntrega = t("messages.dueDateRequired");
    return errors;
  };

  // Submissão do formulário
  const handleSubmit = async (e) => {
  e.preventDefault();
  const errors = validateForm();
  setFormErrors(errors);
  if (Object.keys(errors).length > 0) return;

  const tarefa = {
    nome,
    descricao,
    dataEntrega,
    user: responsavel,
    projetoId,
  };

  setLoading(true);
  try {
    const token = getToken();
    const response = await api.post(`/projetos/${projetoId}/tarefas-novas/`, tarefa, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const tarefaParaUI = {
      id: response.data.id, 
      nome: nome,
      status: 'pendente',
      prazo: dataEntrega,
      responsavel: responsavel,
    };

<<<<<<< HEAD
    if (isSubtask && parentTaskId) {
      tarefa.parentTaskId = parentTaskId;
    }

    setLoading(true);
    try {
      const token = getToken();

      const endpoint = isSubtask && parentTaskId 
        ? `/projetos/${projetoId}/tarefas/${parentTaskId}/subtasks` // ← ENDPOINT PARA SUBTAREFAS
        : `/projetos/${projetoId}/tarefas-novas/`; // ← ENDPOINT PARA TAREFAS PRINCIPAIS

      const response = await api.post(endpoint, tarefa, {
        headers: { Authorization: `Bearer ${token}` },
      });
=======
    if (onTaskCreated) onTaskCreated(tarefaParaUI); 
    onClose();
  } catch (err) {
    setFormErrors({ submit: err.message || t("messages.errorNewTask") });
  } finally {
    setLoading(false);
  }
};
>>>>>>> e10ea44aa8d6f503f8d34e27c748d5de6cb8d820

      if (!isSubtask) {
        try {
          setCreatingCalendarEvent(true);
          await createGoogleCalendarEventFromTask(tarefa, nomeProjeto);
          console.log(' Evento criado no Google Calendar com sucesso');
        } catch (calendarError) {
          console.log(' Evento não criado no Google Calendar (não crítico)');
        } finally {
          setCreatingCalendarEvent(false);
        }
      }

      if (onTaskCreated) onTaskCreated(response.data);
      onClose();
    } catch (err) {
      setFormErrors({ submit: err.message || t("messages.errorNewTask") });
    } finally {
      setLoading(false);
    }
  };

  // Resetar campos e atualizar colaboradores ao abrir/fechar modal
  useEffect(() => {
    if (!isOpen) {
      setNome("");
      setDescricao("");
      setResponsavel(null);
      setDataEntrega("");
      setFormErrors({});
    }
    setCollaborators(initialCollaborators);
  }, [isOpen, initialCollaborators]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Fechar modal clicando fora
  useEffect(() => {
    const handleClickOutside = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{isSubtask ? t("titles.newSubtask") : t("titles.newTask")}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2x2">
              <div className="input-group">
                <label>{isSubtask ? t("inputs.subtaskName") : t("inputs.taskName")}</label>
                <input
                  placeholder={isSubtask ? t("inputs.subtaskName") : t("inputs.taskName")}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                {formErrors.nome && <p className="input-error">{formErrors.nome}</p>}
              </div>

              <div className="input-group">
                <label>{t("inputs.endDate")}</label>
                <input
                  type="date"
                  value={dataEntrega}
                  onChange={(e) => setDataEntrega(e.target.value)}
                />
                {formErrors.dataEntrega && <p className="input-error">{formErrors.dataEntrega}</p>}
              </div>

              <div className="input-group">
                <label>{t("inputs.taskDescription")}</label>
                <textarea
                  placeholder={t("inputs.taskDescription")}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
                {formErrors.descricao && <p className="input-error">{formErrors.descricao}</p>}
              </div>

              <div className="input-group">
                <label>{t("inputs.selectResponsible")} ({t("messages.optional")})</label>
                <select
                  value={responsavel || ""}
                  onChange={(e) => setResponsavel(e.target.value || null)}
                >
                  <option value="">{t("messages.none")}</option>
                  {collaborators.map((collab, index) => (
                    <option key={index} value={collab}>
                      {collab}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formErrors.submit && <p className="input-error center">{formErrors.submit}</p>}

            <div className="save-wrapper">
              <button type="submit" className="save-btn" disabled={loading|| creatingCalendarEvent}>
                 {loading ? (
                    creatingCalendarEvent ? t("buttons.savingAndCreatingEvent") : t("buttons.saving")
                  ) : (
                    isSubtask ? t("buttons.addSubtask") : t("buttons.save")
                  )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalNewTask;
