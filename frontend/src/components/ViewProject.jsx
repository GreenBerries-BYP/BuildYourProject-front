import '../styles/ViewProject.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';

import TaskSection from './TaskSection';
import ModalNewTask from './ModalNewTask';


const ViewProject = ({
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


    tarefasProjeto = [
        {
            nomeTarefa: 'Design',
            progresso: 50,
            tarefas: [
                {
                    nome: 'Protótipo',
                    responsavel: 'Letícia',
                    prazo: '10/05/2025',
                    status: 'concluído',
                },
                {
                    nome: 'Figma',
                    responsavel: 'Millena',
                    prazo: '15/05/2025',
                    status: 'concluído',
                },
                {
                    nome: 'Implementação Visual',
                    responsavel: 'João',
                    prazo: '30/05/2025',
                    status: 'pendente',
                },
            ],
        },
        {
            nomeTarefa: 'POC',
            progresso: 75,
            tarefas: [
                {
                    nome: 'Levantamento Requisitos',
                    responsavel: 'Rodrigo',
                    prazo: '05/05/2025',
                    status: 'concluído',
                },
                {
                    nome: 'Testes de API',
                    responsavel: 'Letícia',
                    prazo: '18/05/2025',
                    status: 'concluído',
                },
                {
                    nome: 'Protótipo Funcional',
                    responsavel: 'João',
                    prazo: '30/05/2025',
                    status: 'pendente',
                },
            ],
        },
        {
            nomeTarefa: 'Conceito',
            progresso: 100,
            tarefas: [
                {
                    nome: 'Definir Escopo',
                    responsavel: 'Millena',
                    prazo: '01/05/2025',
                    status: 'concluído',
                },
                {
                    nome: 'Reunião de Validação',
                    responsavel: 'Rodrigo',
                    prazo: '03/05/2025',
                    status: 'concluído',
                },
            ],
        },
        {
            nomeTarefa: 'Introdução',
            progresso: 100,
            tarefas: [
                {
                    nome: 'Escrever Introdução',
                    responsavel: 'Letícia',
                    prazo: '10/05/2025',
                    status: 'concluído',
                },
                {
                    nome: 'Revisão Texto',
                    responsavel: 'João',
                    prazo: '15/05/2025',
                    status: 'concluído',
                },
            ],
        },

    ]

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
                    <TaskSection
                        key={index}
                        nomeTarefa={tarefa.nomeTarefa}
                        progresso={tarefa.progresso}
                        tarefas={tarefa.tarefas}
                        expanded={expandedSections[tarefa.nomeTarefa]}
                        onToggle={() => toggleSection(tarefa.nomeTarefa)}
                    />
                ))}
            </div>
            <ModalNewTask isOpen={modalAberto} onClose={() => setModalAberto(false)} />
        </div>
    );
};


export default ViewProject;