import { useState } from 'react';
import '../styles/ViewProject.css';
import { useTranslation } from 'react-i18next';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import ModalNewTask from './ModalNewTask';


const ViewProject = ({
  nomeProjeto,
  admProjeto,
  numIntegrantes,
  collaborators, // Added collaborators prop
  tarefasProjeto,
  onVoltar
}) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({});
  const [modalAberto, setModalAberto] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className='view-project'>
        <div className="row project-header">
            <div className="col-12 col-lg-6 order-2 order-lg-1 project-data">
                <h1>{nomeProjeto}</h1>
                <p>{t("viewProject.createdBy", { adm: admProjeto })}</p>
                <p>{t("viewProject.membersCount", { count: numIntegrantes })}</p>

                {collaborators && collaborators.length > 0 && (
                  <div className="project-collaborators">
                    <h4>{t("viewProject.collaboratorsTitle", "Collaborators")}:</h4>
                    <ul>
                      {collaborators.map(collab => (
                        <li key={collab.id || collab.email}>
                          {collab.full_name || collab.email}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
            
            <div className="col-12 col-lg-6 order-1 order-lg-2 project-options">
                <div className='row mb-5 w-100 justify-content-between justify-content-lg-end '>
                    <div className="btns col-6 col-lg-12 order-2 order-lg-1 justify-content-end">
                        <button className='compartilhar-btn'><img src="/imgs/icons-project/Link.svg" alt={t("altText.shareLink")} /></button>
                        <button className='editar-btn'><img src="/imgs/icons-project/Edit.svg" alt={t("altText.editProject")} /></button>
                        <button className='calendario-btn'><img src="/imgs/icons-project/Calendar.svg" alt={t("altText.viewCalendar")} /></button>
                        <button className='fechar-btn' onClick={onVoltar}><img src="/imgs/icons-project/Close.svg" alt={t("altText.closeView")} /></button>
                    </div>

                    <button className='criar-tarefa-btn mt-lg-5 col-5 order-1 order-lg-2 w-50' onClick={() => setModalAberto(true)}>
                        <span>{t('buttons.newTask')}</span>
                        <img src="/imgs/icons-project/add.svg" />
                    </button>
                </div>
            </div>
        </div>

        <div className="project-tasks">
            {tarefasProjeto?.map((tarefa, index) => (
                <div key={index} className="task-section">
                    <div
                        className="task-header row"
                        onClick={() => toggleSection(tarefa.nomeTarefa)}
                    >
                        <span className="task-title col-12 col-lg-6 p-0">
                            <img src={(tarefa.progresso == 100) ? "/imgs/checked.svg" : "/imgs/unchecked.svg"}/>
                            
                            {tarefa.nomeTarefa}
                            
                        </span>
                        <span className='task-data col-12 col-lg-6 px-0'>
                            <span className="task-progress d-flex">
                                <span className="progress">
                                    <span className="progress-bar" role="progressbar" style={{width: `${tarefa.progresso}%`}} aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></span>
                                </span>
                                <span className='progress-label'>{tarefa.progresso}%</span>
                            </span>
                            
                            <span className="expand-icon">
                            {expandedSections[tarefa.nomeTarefa] ? (
                                <MdExpandLess />
                            ) : (
                                <MdExpandMore />
                            )}
                            </span>
                        </span>
                    </div>

                    {expandedSections[tarefa.nomeTarefa] && (
                        <div className="task-table-container">
                            <table className="task-table">
                                <thead>
                                    <tr className='table-header'>
                                        <th></th>
                                        <th>{t("viewProject.taskHeaderTask")}</th>
                                        <th>{t("viewProject.taskHeaderResponsible")}</th>
                                        <th>{t("viewProject.taskHeaderDueDate")}</th>
                                        <th>{t("viewProject.taskHeaderStatus")}</th>
                                    </tr>
                                    <tr className='table-lines'> 
                                        <th><hr /></th>
                                        <th><hr /></th>
                                        <th><hr /></th>
                                        <th><hr /></th>
                                        <th><hr /></th>
                                    </tr>
                                </thead>
                                
                                <tbody>
                                    {tarefa.tarefas.map((etapa, idx) => (
                                        <tr className='task-table-item' key={idx}>
                                            <td>
                                                <img src={(etapa.status == 'concluído') ? "/imgs/checked.svg" : "/imgs/unchecked.svg"} alt={etapa.status === 'concluído' ? t("altText.taskCompleted") : t("altText.taskPending")}/>
                                            </td>
                                            <td>{etapa.nome}</td>
                                            <td>{etapa.responsavel}</td>
                                            <td>{etapa.prazo}</td>
                                            <td>{etapa.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
        <ModalNewTask isOpen={modalAberto} onClose={() => setModalAberto(false)} />
    </div>
  );
};


export default ViewProject;