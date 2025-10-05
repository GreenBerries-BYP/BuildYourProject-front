import React, { useState } from 'react';
import '../styles/ModalAnalise.css';
import { analisarProjeto, aplicarSugestao } from '../api/api';
import toastService from '../api/toastService';

const ModalAnaliseProjeto = ({ isOpen, onClose, projectId, onAnaliseConcluida }) => {
  const [analise, setAnalise] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [aplicandoSugestao, setAplicandoSugestao] = useState(null);

  if (!isOpen) return null;

  const handleAnalisar = async () => {
    setCarregando(true);
    try {
      const resultado = await analisarProjeto(projectId);
     
      if (resultado.erro) {
        toastService.error('Erro na análise', resultado.erro);
        return;
      }
     
      setAnalise(resultado);
     
      if (!resultado.projeto_concluido) {
        toastService.success(
          'Análise concluída!',
          `Probabilidade de atraso: ${resultado.probabilidade_atraso}%`
        );
      }
     
      if (onAnaliseConcluida) {
        onAnaliseConcluida(resultado);
      }
     
    } catch (error) {
      toastService.error(
        'Erro na análise',
        'Não foi possível analisar o projeto'
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleAplicarSugestao = async (sugestao) => {
    setAplicandoSugestao(sugestao.id);
    try {
      const resultado = await aplicarSugestao(projectId, sugestao.id, sugestao.acao);
     
      if (resultado.sucesso) {
        toastService.success(
          'Sugestão aplicada!',
          resultado.mensagem
        );
       
        // Recarregar a análise para mostrar novos dados
        const novaAnalise = await analisarProjeto(projectId);
        setAnalise(novaAnalise);
      }
    } catch (error) {
      toastService.error(
        'Erro ao aplicar sugestão',
        'Não foi possível aplicar a sugestão'
      );
    } finally {
      setAplicandoSugestao(null);
    }
  };

  const getClasseRisco = (probabilidade) => {
    if (probabilidade < 30) return 'baixo-risco';
    if (probabilidade < 70) return 'medio-risco';
    return 'alto-risco';
  };

  const getTextoRisco = (probabilidade) => {
    if (probabilidade < 30) return 'BAIXO RISCO';
    if (probabilidade < 70) return 'MÉDIO RISCO';
    return 'ALTO RISCO';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-analise">
        <div className="modal-header">
          <h2>Análise Inteligente do Projeto</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!analise ? (
            <div className="analise-inicial">
              <img className="icone-analise" src="/imgs/decor-landing/icons-ferramentas/bot.svg" />
              <h3>Analisar Saúde do Projeto</h3>
              <p>Nosso sistema irá analisar o andamento do projeto e sugerir melhorias automáticas.</p>
             
              <button
                className="btn-analisar"
                onClick={handleAnalisar}
                disabled={carregando}
              >
                {carregando ? 'Analisando...' : 'Iniciar Análise'}
              </button>
            </div>
          ) : analise.projeto_concluido ? (
            <div className="projeto-concluido">
              <div className="conclusao-mensagem">
                <h3>Projeto Concluído!</h3>
                <p>{analise.explicacao}</p>
              </div>
              <div className="conclusao-detalhes">
                <p>Todas as tarefas foram finalizadas com sucesso.</p>
              </div>
             
              <div className="metricas-simples">
                <div className="metrica-item">
                  <div className="metrica-valor">{analise.dias_restantes}</div>
                  <div className="metrica-label">Dias de Antecedência</div>
                </div>
               
                <div className="metrica-item">
                  <div className="metrica-valor">{analise.taxa_conclusao}%</div>
                  <div className="metrica-label">Concluído</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="resultados-analise">
              <div className={`indicador-risco ${getClasseRisco(analise.probabilidade_atraso)}`}>
                <div className="probabilidade">
                  {analise.probabilidade_atraso}%
                </div>
                <div className="texto-risco">
                  {getTextoRisco(analise.probabilidade_atraso)}
                </div>
                <div className="label-risco">Probabilidade de Atraso</div>
              </div>

              <div className={`status-projeto ${analise.cor}`}>
                <h4>{analise.status}</h4>
                <p>{analise.explicacao}</p>
              </div>

              <div className="metricas-simples">
                <div className="metrica-item">
                  <div className="metrica-valor">{analise.tarefas_atrasadas}</div>
                  <div className="metrica-label">Tarefas Atrasadas</div>
                </div>
               
                <div className="metrica-item">
                  <div className="metrica-valor">{analise.dias_restantes}</div>
                  <div className="metrica-label">Dias Restantes</div>
                </div>
               
                <div className="metrica-item">
                  <div className="metrica-valor">{analise.tarefas_pendentes}</div>
                  <div className="metrica-label">Tarefas Pendentes</div>
                </div>
               
                <div className="metrica-item">
                  <div className="metrica-valor">{analise.taxa_conclusao}%</div>
                  <div className="metrica-label">Concluído</div>
                </div>
               
                {analise.dias_atraso > 0 && (
                  <div className="metrica-item atraso">
                    <div className="metrica-valor">{analise.dias_atraso}</div>
                    <div className="metrica-label">Dias de Atraso</div>
                  </div>
                )}
              </div>

              {analise.sugestoes && analise.sugestoes.length > 0 ? (
                <div className="sugestoes-lista">
                  <h4>Sugestões Recomendadas</h4>
                 
                  {analise.sugestoes.map((sugestao, index) => (
                    <div key={index} className="sugestao-item">
                      <div className="sugestao-header">
                        <span className={`prioridade ${sugestao.prioridade}`}>
                          {sugestao.prioridade.toUpperCase()}
                        </span>
                        <h5>{sugestao.titulo}</h5>
                      </div>
                     
                      <p className="sugestao-descricao">{sugestao.descricao}</p>
                     
                      <button
                        className={`btn-aplicar ${sugestao.prioridade}`}
                        onClick={() => handleAplicarSugestao(sugestao)}
                        disabled={aplicandoSugestao === sugestao.id}
                      >
                        {aplicandoSugestao === sugestao.id ? 'Aplicando...' : 'Aplicar Sugestão'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sem-sugestoes">
                  <p>Ótimo! O projeto está saudável e não requer ajustes no momento.</p>
                </div>
              )}

              <div className="acoes-finais">
                <button
                  className="btn-reanalisar"
                  onClick={handleAnalisar}
                  disabled={carregando}
                >
                  <img className="icone-reanalisar" src="/imgs/decor-landing/icons-ferramentas/Redo.svg" />
                  &nbsp;Reanalisar Projeto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAnaliseProjeto;