import React, { useState, useEffect, useMemo, useRef } from "react";
import { updateTaskStatus } from "../api/api";
import { DataTable } from "primereact/datatable";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import {
  MdExpandLess,
  MdExpandMore,
  MdCheck,
  MdCheckCircle,
  MdPendingActions,
} from "react-icons/md";
import { ProgressBar } from "primereact/progressbar";
import { useTranslation } from "react-i18next";
import { Avatar } from "primereact/avatar";
import "../styles/TaskSection.css";

const TaskSection = ({ 
  projetoId,
  nomeTarefa, 
  subTarefas, 
  expanded, 
  onToggle, 
  onDeleteClick, 
  onAssignClick
}) => {
  const { t } = useTranslation();
  const [subtasks, setSubtasks] = useState(subTarefas || []);
  const menuRef = useRef(null);

  useEffect(() => {
    setSubtasks(subTarefas || []);
  }, [subTarefas]);

  // como ainda não foi implementada a atribuição de tarefas, força responsavel como "-"
  const subtasksWithResponsible = subtasks.map((sub) => ({
    ...sub,
    responsavel: "-",
    nome: nomeTarefa,
  }));

  // recalcula o progresso sempre que subtasks mudar
  const progresso = useMemo(() => {
    if (!subtasks || subtasks.length === 0) return 0;
    return Math.round(
      (subtasks.filter((t) => t.status === "concluído").length / subtasks.length) * 100
    );
  }, [subtasks]);

  const isCompleted = progresso === 100;

  const handleStatusChange = async (rowData, isChecked) => {
    const originalStatus = rowData.status;

    // Atualiza imediatamente no frontend
    setSubtasks((prev) =>
      prev.map((sub) =>
        sub.id === rowData.id ? { ...sub, status: isChecked ? "concluído" : "pendente" } : sub
      )
    );

    try {
      await updateTaskStatus(rowData.id, isChecked);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      // Reverte se houver erro
      setSubtasks((prev) =>
        prev.map((sub) =>
          sub.id === rowData.id ? { ...sub, status: originalStatus } : sub
        )
      );
    }
  };

  const colaboradores = useMemo(() => {
    if (!Array.isArray(subTarefas)) return [];

    return Array.from(
      new Set(subTarefas.map((t) => t.responsavel).filter(Boolean))
    );
  }, [subTarefas]);


  const statusTemplate = (rowData) => {
    const isFinished = rowData.status === "concluído";
    return (
      <span className={`status-badge ${isFinished ? "concluido" : "pendente"}`}>
        {isFinished ? <MdCheckCircle size={"1.6rem"} /> : <MdPendingActions size={"1.6rem"} />}
        {rowData.status}
      </span>
    );
  };

  const checkboxTemplate = (rowData) => (
    <Checkbox
      key={rowData.id}
      checked={rowData.status === "concluído"}
      onChange={(e) => handleStatusChange(rowData, e.checked)}
    />
  );

  const renderColaboradores = () => {
    return (
      <div className="colaboradores-container">
        {colaboradores.map((responsavel, index) => (
          <Avatar
            key={index}
            label={responsavel?.charAt(0).toUpperCase()}
            title={responsavel}
            shape="circle"
            className="collaborator-avatar"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="task-section">
      <div className="task-header" onClick={onToggle}>
        <div className="task-header-left">
          <div className={`status-circle ${isCompleted ? "completed" : ""}`}>
            {isCompleted && <MdCheck size={"1.8rem"} color="white" />}
          </div>
          <span className="task-title">{nomeTarefa}</span>
        </div>

        <div className="task-header-middle">
          <ProgressBar value={progresso} />
          <span className="progress-label">{progresso}%</span>
        </div>

        <div className="task-header-right">
          <span>
            <button
                className="btn-more"
                onClick={(e) => {
                  e.stopPropagation();
                  menuRef.current.toggle(e);
                }}
              >
                <img src="/imgs/more_vert.svg" alt={t("altText.projectOptions")} />
              </button>
              <Menu
                className="btn-menu-task"
                model={[
                  { 
                    label: t("buttons.assignTask"),
                    command: (e) => {
                        e.originalEvent.preventDefault(); // <- previne comportamento padrão
                        if (onAssignClick) onAssignClick();
                      },                  
                    },
                  { 
                    label: t("buttons.deleteTask"),
                    command: (e) => {
                        e.originalEvent.preventDefault(); // <- previne comportamento padrão
                        if (onDeleteClick) onDeleteClick(); 
                      }, 
                  },
                  { 
                    label: t("buttons.addSubtask"),
                    command: (e) => {
                        e.originalEvent.preventDefault(); // <- previne comportamento padrão
                        if (onAddSubTask) onAddSubTask(); 
                      }, 
                  },
                ]}
                popup
                ref={menuRef}
              />
          </span>
          <span>
            {renderColaboradores()}
            <span className="expand-icon">
              {expanded ? <MdExpandLess size={"2.8rem"} /> : <MdExpandMore size={"2.8rem"} />}
            </span>
          </span>
        </div>
      </div>

      {expanded && (
        <div className="task-table-container">
          <DataTable
            value={subtasksWithResponsible}
            dataKey="id"
            emptyMessage={t("viewProject.noTasks")}
            className="task-datatable"
          >
            <Column body={checkboxTemplate} style={{ width: "5rem" }} />
            <Column field="nome" header={t("viewProject.taskHeaderTask")} />
            <Column field="responsavel" header={t("viewProject.taskHeaderResponsible")} />
            <Column field="status" header={t("viewProject.taskHeaderStatus")} body={statusTemplate} />
            <Column field="prazo" header={t("viewProject.taskHeaderDueDate")} />
          </DataTable>
        </div>
      )}
    </div>
  );
};

export default TaskSection;
