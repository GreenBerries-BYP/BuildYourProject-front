import React, { useState } from "react";

import { updateTaskStatus } from "../api/api";
import { useEffect } from "react";

import { DataTable } from "primereact/datatable";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
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

const TaskSection = ({ nomeTarefa, subTarefas, expanded, onToggle }) => {
  const { t } = useTranslation();
  const [subtasks, setSubtasks] = useState(subTarefas);

  useEffect(() => {
    setSubtasks(subTarefas);
  }, [subTarefas]);

  const progresso = Math.round(
    (subtasks.filter((t) => t.status === "concluído").length /
      subtasks.length) *
      100
  );
  const isCompleted = progresso === 100;

  const handleStatusChange = (rowData) => {
    setSubtasks((prev) =>
      prev.map((sub) =>
        sub.id === rowData.id
          ? {
              ...sub,
              status: sub.status === "concluído" ? "pendente" : "concluído",
            }
          : sub
      )
    );
  };

  //     const handleStatusChange = async (rowData) => {
  //     try {
  //       const updated = await updateTaskStatus(
  //         rowData.id,
  //         rowData.status !== "concluído"
  //       );
  //       setSubtasks((prev) =>
  //         prev.map((t) =>
  //           t.id === updated.id ? { ...t, status: updated.status } : t
  //         )
  //       );
  //     } catch (error) {
  //       console.error("Erro ao atualizar status:", error);
  //     }
  //   };

  const colaboradores = Array.from(
    new Set(subTarefas.map((t) => t.responsavel).filter(Boolean))
  );

  const statusTemplate = (rowData) => {
    const isFinished = rowData.status === "concluído";
    return (
      <span className={`status-badge ${isFinished ? "concluido" : "pendente"}`}>
        {isFinished ? (
          <MdCheckCircle size={"1.6rem"} />
        ) : (
          <MdPendingActions size={"1.6rem"} />
        )}
        {rowData.status}
      </span>
    );
  };

  const checkboxTemplate = (rowData) => (
    <Checkbox
      key={rowData.id}
      onChange={() => handleStatusChange(rowData)}
      checked={rowData.status === "concluído"}
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
          {renderColaboradores()}
          <span className="expand-icon">
            {expanded ? (
              <MdExpandLess size={"2.8rem"} />
            ) : (
              <MdExpandMore size={"2.8rem"} />
            )}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="task-table-container">
          <DataTable
            value={subtasks}
            dataKey="id"
            emptyMessage={t("viewProject.noTasks")}
            className="task-datatable"
          >
            <Column body={checkboxTemplate} style={{ width: "5rem" }} />
            <Column field="nome" header={t("viewProject.taskHeaderTask")} />
            <Column
              field="responsavel"
              header={t("viewProject.taskHeaderResponsible")}
            />
            <Column
              field="status"
              header={t("viewProject.taskHeaderStatus")}
              body={statusTemplate}
            />
            <Column field="prazo" header={t("viewProject.taskHeaderDueDate")} />
          </DataTable>
        </div>
      )}
    </div>
  );
};

export default TaskSection;
