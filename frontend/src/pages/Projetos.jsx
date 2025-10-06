import React, { useState, useEffect } from 'react';
import { fetchProjects } from '../api/api';
import { fetchProjectWithTasks } from '../api/api';
import { useSearch } from '../context/SearchContext';


import ProjectCard from "../components/ProjectCard";
import CreateProjectCard from "../components/CreateProjectCard";
import ViewProject from "../components/ViewProject";
import ModalNewProject from "../components/ModalNewProject";
import ModalDeleteProject from "../components/ModalDeleteProject";

import '../styles/Home.css';
import { fetchUserData } from '../api/userService';


const formatProjectForCard = (projeto) => {
  const totalTasks = projeto.tasks?.length || 0;
  const completedTasks = projeto.tasks?.filter((t) => t.is_completed).length || 0;
  const progressoProjeto = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    ...projeto,
    progressoProjeto,
    progressoIndividual: progressoProjeto,
    tarefasProjeto: projeto.tasks?.slice(0, 4) || [],
  };
};


// precisa filtrar os projetos de sua autoria
function Projetos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [userData, setUserData] = useState(null);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projetosFiltrados, setProjetosFiltrados] = useState([]);
  const { searchTerm } = useSearch();

  useEffect(() => {
    fetchUserData()
      .then(data => {
        setUserData(data);
        console.log('Email do usuário logado:', data.email);
      })
      .catch(error => {
        console.error('Erro ao buscar dados do usuário:', error);
      });
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = projetos.filter(item => {
      return item.name.toLowerCase().includes(lowercasedFilter);
    });
    setProjetosFiltrados(filteredData);
  }, [searchTerm, projetos]);

  useEffect(() => {
    if (modalAberto) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [modalAberto, projetoSelecionado]);

  const handleCreateProject = () => {
    setModalAberto(true);
  };

  const handleVoltar = () => {
    setProjetoSelecionado(null);
    console.log(projetoSelecionado)
  };



  useEffect(() => {
    const carregarProjetos = async () => {
      //const carregarMeusProjetos = async () => {
      try {
        const data = await fetchProjects();

        setProjetos(data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      }
    };

    carregarProjetos();
  }, []);

  const handleAbrirProjeto = async (projeto) => {
    try {
      const projetoCompleto = await fetchProjectWithTasks(projeto.id);
      setProjetoSelecionado(projetoCompleto);
      setSelectedProjectId(projeto.id);
    } catch (error) {
      console.error("Erro ao carregar projeto completo:", error);
    }
  };

  const handleDeleteProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    setDeleteModalOpen(true);
  };

  return (
    <>
      {projetoSelecionado ? (
        <div className='d-flex w-100 justify-content-center align-items-center'>
          <ViewProject
            projetoId={selectedProjectId}
            nomeProjeto={projetoSelecionado.name}
            admProjeto={projetoSelecionado.creator_name}
            numIntegrantes={projetoSelecionado.collaborator_count}
            collaborators={projetoSelecionado.collaborators || []}
            tarefasProjeto={projetoSelecionado.tarefasProjeto || []}
            onVoltar={handleVoltar}
            dataInicio={projetoSelecionado.data_inicio}
            dataFim={projetoSelecionado.data_fim}

          />
        </div>) : (
        <div className="projects-area">
          <CreateProjectCard onClick={handleCreateProject} />

          {projetosFiltrados.map((projeto, index) => {
            const totalTasks = projeto.tasks?.length || 0;
            const completedTasks = projeto.tasks?.filter((t) => t.is_completed).length || 0;
            const progressoProjeto = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <ProjectCard
                key={projeto.id}
                projetoId={projeto.id}
                nomeProjeto={projeto.name}
                progressoProjeto={progressoProjeto}
                progressoIndividual={progressoProjeto} // por enquanto igual
                tarefasProjeto={projeto.tasks?.slice(0, 4) || []}
                estaAtrasado={false} // se quiser calcular depois, pode colocar lógica
                onClick={() => handleAbrirProjeto(projeto)}
                onDeleteClick={handleDeleteProjectClick}
              />
            );
          })}
        </div>
      )}

      <ModalNewProject
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />

      <ModalDeleteProject
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        projetoId={selectedProjectId}
        onDeleteSuccess={(id) => {
          setProjetos(projetos.filter(p => p.id !== id));
          setSelectedProjectId(null);
        }}
      />
    </>
  )
}

export default Projetos;
