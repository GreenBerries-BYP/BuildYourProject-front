import React, { useState, useEffect } from 'react';
import { fetchProjects } from '../api/api';

import ProjectCard from "../components/ProjectCard";
import CreateProjectCard from "../components/CreateProjectCard";
import ViewProject from "../components/ViewProject";
import ModalNewProject from "../components/ModalNewProject";

import '../styles/Home.css';
import { fetchUserData } from '../api/userService';


// precisa filtrar os projetos de sua autoria
function Projetos() {
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

  const handleAbrirProjeto = (projeto) => {
    setProjetoSelecionado(projeto);
  };

  const handleVoltar = () => {
    setProjetoSelecionado(null);
    console.log(projetoSelecionado)
  };

  const [projetos, setProjetos] = useState([]);


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
        </div>) : (
        <div className="projects-area">
          <CreateProjectCard onClick={handleCreateProject} />

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
  )
}

export default Projetos;