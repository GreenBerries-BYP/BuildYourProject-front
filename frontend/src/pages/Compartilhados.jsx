import React, { useState, useEffect } from 'react';
import { fetchProjects, fetchSharedWithMe, fetchProjectWithTasks } from '../api/api';

import ProjectCard from "../components/ProjectCard";
import ViewProject from "../components/ViewProject";
import ModalNewProject from "../components/ModalNewProject";

import '../styles/Home.css';
import { fetchUserData } from '../api/userService';

// aparecem os que foram compartilhados, sem o botão de criar.
function Compartilhados() {
  const [modalAberto, setModalAberto] = useState(false);
  const [userData, setUserData] = useState(null);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);

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

const handleAbrirProjeto = async (projeto) => {
  try {
    const projetoCompleto = await fetchSharedWithMe(projeto.id);
    setProjetoSelecionado(projetoCompleto);
  } catch (error) {
    console.error("Erro ao carregar projeto completo:", error);
  }
};

  const handleVoltar = () => {
    setProjetoSelecionado(null);
    console.log(projetoSelecionado)
  };

  const [projetos, setProjetos] = useState([]);


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


  return (
    <>
        {projetoSelecionado ? (
          <div className='d-flex w-100 justify-content-center align-items-center'>
            <ViewProject
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

        {projetos.map((projeto, index) => {
          // garante que exista tasks, mesmo que não venha do backend
          const tarefas = projeto.tasks || projeto.tarefasProjeto || [];

          const totalTasks = tarefas.length;
          const completedTasks = tarefas.filter((t) => t.is_completed).length;
          const progressoProjeto = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <ProjectCard
              key={index}
              nomeProjeto={projeto.name}
              progressoProjeto={progressoProjeto}
              progressoIndividual={progressoProjeto} // igualzinho à Home
              tarefasProjeto={tarefas.slice(0, 4)} // pega só as 4 primeiras
              estaAtrasado={false} // se quiser depois adiciona lógica real
              onClick={() => handleAbrirProjeto(projeto)}
            />
          );
        })}
          </div>
        )}

      <ModalNewProject
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </>
  );
}

export default Compartilhados;
