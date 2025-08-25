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
    const projetoCompleto = await fetchProjectWithTasks(projeto.id);
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

            {projetos.map((projeto, index) => (
              <ProjectCard
                key={index}
                nomeProjeto={projeto.name}
                progressoProjeto={projeto.progressoProjeto}
                progressoIndividual={projeto.progressoIndividual}
                tarefasProjeto={projeto.tarefasProjeto}
                estaAtrasado={projeto.estaAtrasado}
                onClick={() => handleAbrirProjeto(projeto)}
              />
            ))}
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
