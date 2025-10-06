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

    // Adicionar esta função de validação
  const validateUniqueName = async (taskName) => {
    if (!taskName.trim() || isSubtask) return true; // Não valida subtarefas
    
    try {
      const token = getToken();
      const response = await api.get(`/projetos/${projetoId}/tarefas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const existingTasks = response.data;
      return !existingTasks.some(task => task.nome.toLowerCase() === taskName.toLowerCase());
    } catch (error) {
      console.error("Erro ao verificar tarefas existentes:", error);
      return true; // Em caso de erro, permite a criação
    }
  };

  // Atualizar a validação do formulário
  const validateForm = async () => {
    const errors = {};
    if (!nome.trim()) errors.nome = t("messages.taskNameRequired");
    if (!descricao.trim()) errors.descricao = t("messages.taskDescriptionRequired");
    if (!dataEntrega) errors.dataEntrega = t("messages.dueDateRequired");
    
    // Validação de nome único apenas para tarefas principais
    if (nome.trim() && !isSubtask) {
      const isUnique = await validateUniqueName(nome);
      if (!isUnique) {
        errors.nome = t("messages.taskNameExists");
      }
    }
    
    return errors;
  };

  // Submissão do formulário
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    try {

      const errors = await validateForm(); // Agora é async
      setFormErrors(errors);
      
      if (Object.keys(errors).length > 0) {
        setLoading(false);
        return;
      }
      const token = getToken();

      let requestData;
      let endpoint;

      if (isSubtask && parentTaskId) {
        endpoint = `/projetos/${projetoId}/tarefas/${parentTaskId}/subtasks`;
        requestData = {
          nome: nome,
          descricao: descricao,
          dataEntrega: dataEntrega,
          user: responsavel,
        };
      } else {
        endpoint = `/projetos/${projetoId}/tarefas-novas/`;
        requestData = {
          nome: nome,
          descricao: descricao,
          dataEntrega: dataEntrega,
          user: responsavel,
          projetoId: projetoId,
        };
      }

      console.log("Enviando dados:", requestData); // Para debug

      const response = await api.post(endpoint, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Cria evento no Google Calendar apenas para tarefas principais
      if (!isSubtask) {
        try {
          setCreatingCalendarEvent(true);
          
          // Criar objeto tarefa completo para o calendário
          const tarefaParaCalendario = {
            id: response.data.id || response.data.task_id,
            nome: nome,
            descricao: descricao,
            dataEntrega: dataEntrega,
            responsavel: responsavel,
          };
          
          await createGoogleCalendarEventFromTask(tarefaParaCalendario, nomeProjeto);
          console.log('Evento criado no Google Calendar com sucesso');
        } catch (calendarError) {
          console.log('Evento não criado no Google Calendar (não crítico)', calendarError);
        } finally {
          setCreatingCalendarEvent(false);
        }
      }

      // Preparar dados para UI
      const selectedCollaborator = collaborators.find(collab => collab.email === responsavel);

      const tarefaParaUI = {
        id: response.data.id || response.data.task_id,
        nome: nome,
        status: 'pendente',
        prazo: dataEntrega,
        responsavel: selectedCollaborator ? selectedCollaborator.full_name : responsavel, // Nome ou email
        descricao: descricao,
        user: responsavel, // Garantir que o email também seja salvo
      };

      if (onTaskCreated) onTaskCreated(tarefaParaUI);
      onClose();
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
      setFormErrors({ 
        submit: err.response?.data?.message || err.message || t(isSubtask ? "messages.errorNewSubtask" : "messages.errorNewTask") 
      });
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
                  {collaborators.map((collab) => (
                    <option key={collab.id} value={collab.email}> {/* ← Usar email como value */}
                      {collab.full_name} ({collab.email}) {/* ← Mostrar nome e email */}
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
