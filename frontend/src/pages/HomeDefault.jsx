import React, { useState, useEffect } from "react";
import { fetchProjects } from "../api/api";
import { fetchProjectWithTasks } from '../api/api';

import ProjectCard from "../components/ProjectCard";
import CreateProjectCard from "../components/CreateProjectCard";
import ViewProject from "../components/ViewProject";
import ModalNewProject from "../components/ModalNewProject";
import ModalDeleteProject from "../components/ModalDeleteProject";

import "../styles/Home.css";
import { fetchUserData } from "../api/userService";

// aparecem todos os seus projetos
function HomeDefault() {
  const [modalAberto, setModalAberto] = useState(false);
  const [userData, setUserData] = useState(null);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);


  useEffect(() => {
    fetchUserData()
      .then((data) => {
        setUserData(data);
        console.log("Email do usuário logado:", data.email);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados do usuário:", error);
      });
  }, []);

  useEffect(() => {
    if (modalAberto) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [modalAberto, projetoSelecionado]);

  const handleCreateProject = () => {
    setModalAberto(true);
  };

  const handleAbrirProjeto = async (projeto) => {
  try {
    const projetoCompleto = await fetchProjectWithTasks(projeto.id);
    setProjetoSelecionado(projetoCompleto);
    setSelectedProjectId(projeto.id);
  } catch (error) {
    console.error("Erro ao carregar projeto completo:", error);
  }
};

  const handleVoltar = () => {
    setProjetoSelecionado(null);
    console.log(projetoSelecionado);
    console.log(selectedProjectId);
   
  };

  const [projetos, setProjetos] = useState([]);

  useEffect(() => {
    const carregarProjetos = async () => {
      try {
        const data = await fetchProjects();
        setProjetos(data);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
      }
    };

    carregarProjetos();
  }, []);

  const handleToggleTask = async (projectId, taskId, isCompleted) => {
    try {
      await api.updateTask(projectId, taskId, { is_completed: !isCompleted });
      // Atualize o estado dos projetos
      setProjetos(
        projetos.map((proj) => {
          if (proj.id === projectId) {
            return {
              ...proj,
              tasks: proj.tasks.map((t) =>
                t.id === taskId ? { ...t, is_completed: !isCompleted } : t
              ),
            };
          }
          return proj;
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  const handleDeleteProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    setDeleteModalOpen(true);
  };

  return (
    <>
      {projetoSelecionado ? (
        <div className="d-flex w-100 justify-content-center align-items-center">
          <ViewProject
            projetoId={selectedProjectId}
            nomeProjeto={projetoSelecionado.name}
            admProjeto={projetoSelecionado.creator_name}
            numIntegrantes={projetoSelecionado.collaborator_count}
            collaborators={projetoSelecionado.collaborators || []}
            tarefasProjeto={projetoSelecionado.tarefasProjeto || []}
            onVoltar={handleVoltar}
          />
        </div>
      ) : (
        <div className="projects-area">
          <CreateProjectCard onClick={handleCreateProject} />

          {projetos.map((projeto, index) => {
            const totalTasks = projeto.tasks.length;
            const completedTasks = projeto.tasks.filter(
              (t) => t.is_completed
            ).length;

            const progressoProjeto =
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

            const progressoIndividual = progressoProjeto; // por enquanto, assume igual
            const estaAtrasado = false;

            return (
              <ProjectCard
                key={index}
                projetoId={projeto.id}
                nomeProjeto={projeto.name}
                progressoProjeto={progressoProjeto}
                progressoIndividual={progressoIndividual}
                tarefasProjeto={projeto.tasks.slice(0, 4)}
                estaAtrasado={estaAtrasado}
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
          selectedProjectId(null);
        }}
      />
    </>
  );
}

export default HomeDefault;
