import React, { useState, useEffect } from 'react';
import { fetchProjects, fetchSharedWithMe, fetchProjectWithTasks } from '../api/api';
import { useSearch } from '../context/SearchContext';

import ProjectCard from "../components/ProjectCard";
import ViewProject from "../components/ViewProject";
import ModalNewProject from "../components/ModalNewProject";
import ModalDeleteProject from "../components/ModalDeleteProject";

import '../styles/Home.css';
import { fetchUserData } from '../api/userService';

// aparecem os que foram compartilhados, sem o botão de criar.
function Compartilhados() {
  const [modalAberto, setModalAberto] = useState(false);
  const [userData, setUserData] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
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

  const handleAbrirProjeto = async (projeto) => {
    try {
      // Use a mesma função que funciona em Projetos
      const projetoCompleto = await fetchProjectWithTasks(projeto.id);
      setProjetoSelecionado(projetoCompleto);
      setSelectedProjectId(projeto.id);
    } catch (error) {
      console.error("Erro ao carregar projeto completo:", error);
    }
  };

  const handleVoltar = () => {
    setProjetoSelecionado(null);
    console.log(projetoSelecionado)
  };



  useEffect(() => {
    const carregarProjetos = async () => {
      try {
        const data = await fetchSharedWithMe();

        setProjetos(data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      }
    };

    carregarProjetos();
  }, []);

  const handleDeleteProjectClick = (projectId) => {
    alert('Você não pode deletar um projeto que não é seu!');
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
        </div>
      ) : (
        <div className="projects-area">

          {projetosFiltrados.map((projeto, index) => {
            const totalTasks = projeto.tasks?.length || 0;
            const completedTasks = projeto.tasks?.filter((t) => t.is_completed).length || 0;
            const progressoProjeto = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            console.log(projeto.tasks);


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
          selectedProjectId(null);
        }}
      />
    </>
  );
}

export default Compartilhados;
