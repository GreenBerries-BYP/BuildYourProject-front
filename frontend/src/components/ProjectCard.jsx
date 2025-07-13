import { useRef } from "react";
import { Knob } from "primereact/knob";
import { Menu } from "primereact/menu";
import { useTranslation } from "react-i18next";

import "../styles/ProjectCard.css";

const ProjectCard = ({
  nomeProjeto,
  progressoProjeto,
  progressoIndividual,
  tarefasProjeto,
  estaAtrasado,
  onClick,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef(null);

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
          model={[{ label: t("buttons.deleteProject") }]}
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

      {/* Lista de tarefas */}
      <div className="tasks">
        {tarefasProjeto?.map((tarefa, idx) => (
          <div className="flex align-items-center gap-2" key={idx}>
            <span
              className={`status-dot ${
                tarefa.is_completed
                  ? "bg-purple-500"
                  : "border-2 border-gray-400"
              } border-circle`}
              style={{ width: "12px", height: "12px" }}
            />
            <span>{tarefa.title}</span>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-end align-items-center gap-2">
        {estaAtrasado && (
          <img src="/imgs/alert.svg" alt={t("altText.alertIcon")} />
        )}
        <span>{t("project.yourTasks")}</span>
        <div className="round-progress">
          <Knob
            value={progressoIndividual || 0}
            readOnly
            size={50}
            valueTemplate="{value}%"
            valueColor="#7b46ff"
            rangeColor="#e2d8ff"
            textColor="#333"
            strokeWidth={10}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
