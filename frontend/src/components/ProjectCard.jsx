import { Knob } from "primereact/knob";
import { Menu } from "primereact/menu";
import { Checkbox } from "primereact/checkbox";
import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect } from "react";
import "../styles/ProjectCard.css";

const ProjectCard = ({
  projetoId,
  nomeProjeto,
  progressoProjeto,
  progressoIndividual,
  tarefasProjeto,
  estaAtrasado,
  onClick,
  onDeleteClick,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.container.contains(e.target)) {
        menuRef.current.hide();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="project-card" onClick={onClick}>
      <div className="card-header">
        {nomeProjeto}
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
          className="btn-menu-project"
          model={[{ 
            label: t("buttons.deleteProject"),
            command: () => onDeleteClick(projetoId),
          }]}
          popup
          ref={menuRef}
        />
      </div>

      <div className="project-progress">
        <div className="progress w-75">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progressoProjeto}%` }}
            aria-valuenow={progressoProjeto}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        <span className="progress-label">{progressoProjeto}%</span>
      </div>

      <div className="tasks d-flex flex-column">
        {tarefasProjeto?.map((tarefa, idx) => (
          <div
            key={idx}
            className="d-flex align-items-center"
            >
            <Checkbox
              inputId={`task-${idx}`}
              checked={!!tarefa.is_completed}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => field.onChange(e.checked)}
              className="me-2"
            />
            <label className="mt-2" htmlFor={`task-${idx}`}>
              {tarefa.title}
            </label>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-end align-items-center gap-2">
        {estaAtrasado && (
          <img src="/imgs/alert.svg" alt={t("altText.alertIcon")} />
        )}
        <span>{t("project.yourTasks")}</span>
        <div className="round-progress" style={{ position: "relative" }}>
          <Knob
            value={progressoIndividual || 0}
            readOnly
            size={50}
            valueTemplate=""
            valueColor="var(--purple-color)"
            rangeColor="var(--gray-light-color)"
            strokeWidth={10}
          />
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "1rem",
              fontWeight: "600",
              color: "var(--black-color)",
            }}
          >
            {progressoIndividual}%
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default ProjectCard;
