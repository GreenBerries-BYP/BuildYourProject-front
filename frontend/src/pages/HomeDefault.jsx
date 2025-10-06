import React, { useState, useEffect, useCallback } from "react";
import { fetchProjects } from "../api/api";
import { fetchProjectWithTasks } from "../api/api";
import { useSearch } from "../context/SearchContext";
import { ProgressSpinner } from "primereact/progressspinner";

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
  const [projetos, setProjetos] = useState([]);
  const [projetosFiltrados, setProjetosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const { searchTerm } = useSearch();

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

  // Filtra os projetos sempre que o termo de busca ou a lista original mudar
  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = projetos.filter((item) => {
      return item.name.toLowerCase().includes(lowercasedFilter);
    });
    setProjetosFiltrados(filteredData);
  }, [searchTerm, projetos]);

  const handleCreateProject = () => {
    setModalAberto(true);
  };

  const handleAbrirProjeto = async (projeto) => {
    setLoadingProject(true);
    try {
      const projetoCompleto = await fetchProjectWithTasks(projeto.id);
      setProjetoSelecionado(projetoCompleto);
      setSelectedProjectId(projeto.id);
    } catch (error) {
      console.error("Erro ao carregar projeto completo:", error);
    } finally {
      setLoadingProject(false);
    }
  };

  const handleVoltar = () => {
    setProjetoSelecionado(null);
    console.log(projetoSelecionado);
    console.log(selectedProjectId);
  };

  const carregarProjetos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjetos(data);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProjetos();
  }, [carregarProjetos]);

  const handleProjectCreated = () => {
    carregarProjetos();
    setModalAberto(false);
  };

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center w-100 h-100">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <>
      {loadingProject ? (
        <div className="d-flex justify-content-center align-items-center w-100 h-100">
          <ProgressSpinner />
        </div>
      ) : projetoSelecionado ? (
        <div className="d-flex w-100 justify-content-center align-items-center">
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
        </div>
      ) : (
        <div className="projects-area">
          <CreateProjectCard onClick={handleCreateProject} />

          {projetosFiltrados.map((projeto, index) => {
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
        onProjectCreated={handleProjectCreated}
      />

      <ModalDeleteProject
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        projetoId={selectedProjectId}
        onDeleteSuccess={(id) => {
          setProjetos(projetos.filter((p) => p.id !== id));
          selectedProjectId(null);
        }}
      />
    </>
  );
}

export default HomeDefault;
