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
      setAnalise(resultado);
      
      if (resultado.sucesso) {
        toastService.success(
          'Análise concluída!',
          `Probabilidade de atraso: ${resultado.probabilidade_atraso}%`
        );
        
        if (onAnaliseConcluida) {
          onAnaliseConcluida(resultado);
        }
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
            // Tela inicial - botão para iniciar análise
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
          ) : (
            // Resultados da análise
            <div className="resultados-analise">
              {/* Indicador de Risco */}
              <div 
                className={`indicador-risco ${getClasseRisco(analise.probabilidade_atraso)}`}
              >
                <div className="probabilidade">
                  {analise.probabilidade_atraso}%
                </div>
                <div className="texto-risco">
                  {getTextoRisco(analise.probabilidade_atraso)}
                </div>
                <div className="label-risco">Probabilidade de Atraso</div>
              </div>

              {/* Sugestões */}
              {analise.sugestoes && analise.sugestoes.length > 0 ? (
                <div className="sugestoes-lista">
                  <h4>💡 Sugestões Recomendadas</h4>
                  
                  {analise.sugestoes.map((sugestao, index) => (
                    <div key={index} className="sugestao-item">
                      <div className="sugestao-header">
                        <span className={`prioridade ${sugestao.prioridade}`}>
                          {sugestao.prioridade.toUpperCase()}
                        </span>
                        <h5>{sugestao.titulo}</h5>
                      </div>
                      
                      <p className="sugestao-descricao">{sugestao.descricao}</p>
                      
                      {sugestao.detalhes && (
                        <p className="sugestao-detalhes">{sugestao.detalhes}</p>
                      )}
                      
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

              {/* Botão para reanalisar */}
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