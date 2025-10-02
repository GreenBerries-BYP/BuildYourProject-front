import '../styles/ViewProject.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TaskSection from './TaskSection';
import ModalNewTask from './ModalNewTask';
import ModalDeleteTask from "../components/ModalDeleteTask";
import ModalAssignTask from "../components/ModalAssignTask";
import ModalAnaliseProjeto from "../components/ModalAnaliseProjeto"; 
import Schedule from '../components/Schedule';


const ViewProject = ({
    projetoId,
    nomeProjeto,
    admProjeto,
    numIntegrantes,
    collaborators,
    tarefasProjeto,
    onVoltar
}) => {
    const { t } = useTranslation();
    const [expandedSections, setExpandedSections] = useState({});
    const [modalAberto, setModalAberto] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [analiseModalOpen, setAnaliseModalOpen] = useState(false);

    const [selectedTasktId, setSelectedTasktId] = useState(null);
    const [selectedTaskIdForAssign, setSelectedTaskIdForAssign] = useState(null);
    const [tarefasProjetoState, setTarefasProjetoState] = useState(tarefasProjeto || []);
    const [showSchedule, setShowSchedule] = useState(false);


    const handleDeleteTaskClick = (taskId) => {
        setSelectedTasktId(taskId);
        setDeleteModalOpen(true);
    };

    const handleAssignTaskClick = (taskId) => {
        setSelectedTaskIdForAssign(taskId);
        setAssignModalOpen(true);
    };

    const handleCreateTask = (novaTarefa) => {
        setTarefasProjetoState((prev) => [...prev, novaTarefa]);
        setModalAberto(false);
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleAnaliseConcluida = (resultadoAnalise) => {
        console.log('Análise concluída:', resultadoAnalise);
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
                                {collaborators.map((collab, idx) => (
                                    <li key={idx}>{collab}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="col-12 col-lg-6 order-1 order-lg-2 project-options">
                    <div className='row mb-5 w-100 justify-content-between justify-content-lg-end '>
                        <div className="btns col-6 col-lg-12 order-2 order-lg-1 justify-content-end">
                            <button 
                                className='analisar-btn'
                                onClick={() => setAnaliseModalOpen(true)}
                                title="Analisar saúde do projeto"
                            >
                                <img src="/imgs/icons-project/Chart.svg" alt="Analisar projeto" />
                            </button>
                            
                            <button className='compartilhar-btn'><img src="/imgs/icons-project/Link.svg" alt={t("altText.shareLink")} /></button>
                            <button className='editar-btn'><img src="/imgs/icons-project/Edit.svg" alt={t("altText.editProject")} /></button>
                            <button className='calendario-btn' onClick={() => setShowSchedule(true)}>
                                <img src="/imgs/icons-project/Calendar.svg" alt={t("altText.viewCalendar")} />
                            </button>
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
                {showSchedule ? (
                    <Schedule
                        projetoId={projetoId}
                        nomeProjeto={nomeProjeto}
                        onVoltar={() => setShowSchedule(false)}
                    />
                ) : (
                    <div className="project-tasks">
                        {tarefasProjetoState?.map((tarefa, index) => (
                            <TaskSection
                                key={index}
                                projetoId={projetoId}
                                nomeTarefa={tarefa.nomeTarefa}
                                progresso={tarefa.progresso}
                                subTarefas={tarefa.subTarefas}
                                expanded={expandedSections[tarefa.nomeTarefa]}
                                onToggle={() => toggleSection(tarefa.nomeTarefa)}
                                onDeleteClick={() => handleDeleteTaskClick(tarefa.id)}
                                onAssignClick={() => handleAssignTaskClick(tarefa.id)}
                            />
                        ))}
                    </div>
                )}

            </div>
            <ModalNewTask 
                isOpen={modalAberto} 
                onClose={() => setModalAberto(false)} 
                projetoId={projetoId} // <-- passar o ID do projeto atual
                onTaskCreated={handleCreateTask}
                collaborators={collaborators}
            />
            <ModalDeleteTask
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                taskId={selectedTasktId}
                onDeleteSuccess={(id) => {
                    setTarefasProjetoState(tarefasProjetoState.filter(t => t.id !== id));
                    setSelectedTasktId(null);
                }}
            />
            <ModalAssignTask
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                taskId={selectedTaskIdForAssign}
                project={{
                    id: projetoId,
                    name: nomeProjeto,
                    collaborators: collaborators || [], // ← Agora passa os colaboradores corretamente
                }}
                onAssignSuccess={(collaborator) => {
                    // Atualiza a UI com os dados do colaborador
                    setTarefasProjetoState((prev) =>
                    prev.map((t) =>
                        t.id === selectedTaskIdForAssign
                        ? { 
                            ...t, 
                            assignedTo: collaborator.full_name || collaborator.name,
                            assignedEmail: collaborator.email,
                            assignedUserId: collaborator.id
                            }
                        : t
                    )
                    );
                    setSelectedTaskIdForAssign(null);
            }}
            />
            <ModalAnaliseProjeto
                isOpen={analiseModalOpen}
                onClose={() => setAnaliseModalOpen(false)}
                projectId={projetoId}
                onAnaliseConcluida={handleAnaliseConcluida}
            />
        </div>
    );
};


export default ViewProject;
