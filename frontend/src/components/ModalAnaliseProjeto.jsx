import React, { useState } from 'react';
import '../styles/ModalAnalise.css';
import { analisarProjeto, aplicarSugestao } from '../api/api';
import toastService from '../api/toastService';
import { useTranslation } from 'react-i18next';

const ModalAnaliseProjeto = ({ isOpen, onClose, projectId, onAnaliseConcluida }) => {
  const { t } = useTranslation();
  const [analise, setAnalise] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [aplicandoSugestao, setAplicandoSugestao] = useState(null);

  if (!isOpen) return null;

  const handleAnalisar = async () => {
    setCarregando(true);
    try {
      const resultado = await analisarProjeto(projectId);
     
      if (resultado.erro) {
        toastService.error(t('toast.analysisError'), resultado.erro);
        return;
      }
     
      setAnalise(resultado);
     
      if (!resultado.projeto_concluido) {
        toastService.success(
          t('messages.analysisCompleted'),
          `${t('messages.probabilityOfDelay')}: ${resultado.probabilidade_atraso}%`
        );
      }
     
      if (onAnaliseConcluida) {
        onAnaliseConcluida(resultado);
      }
     
    } catch (error) {
      toastService.error(
        t('toast.analysisError'),
        t('toast.analysisFailed')
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
          t('toast.suggestionApplied'),
          resultado.mensagem
        );
       
        // Recarregar a análise para mostrar novos dados
        const novaAnalise = await analisarProjeto(projectId);
        setAnalise(novaAnalise);
      }
    } catch (error) {
      toastService.error(
        t('toast.suggestionError'),
        t('toast.suggestionFailed')
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
    if (probabilidade < 30) return t('messages.lowRisk');
    if (probabilidade < 70) return t('messages.mediumRisk');
    return t('messages.highRisk');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-analise">
        <div className="modal-header">
          <h2>{t('messages.projectAnalysis')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!analise ? (
            <div className="analise-inicial">
              <img className="icone-analise" src="/imgs/decor-landing/icons-ferramentas/bot.svg" />
              <h3>{t('messages.analyzeProjectHealth')}</h3>
              <p>{t('messages.analysisDescription')}</p>
             
              <button
                className="btn-analisar"
                onClick={handleAnalisar}
                disabled={carregando}
              >
                {carregando ? t('messages.analyzing') : t('messages.startAnalysis')}
              </button>
            </div>
          ) : analise.projeto_concluido ? (
            <div className="projeto-concluido">
              <div className="conclusao-mensagem">
                <h3>{t('messages.projectCompleted')}</h3>
                <p>{analise.explicacao}</p>
              </div>
              <div className="conclusao-detalhes">
                <p>{t('messages.allTasksCompleted')}</p>
              </div>
             
              <div className="metricas-tabela">
                <table className="tabela-metricas">
                  <tbody>
                    <tr>
                      <td className="metrica-item">
                        <div className="metrica-valor">{analise.dias_restantes}</div>
                        <div className="metrica-label">{t('messages.remainingDays')}</div>
                      </td>
                      <td className="metrica-item">
                        <div className="metrica-valor">{analise.taxa_conclusao}%</div>
                        <div className="metrica-label">{t('messages.completed')}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                <div className="label-risco">{t('messages.probabilityOfDelay')}</div>
              </div>

              <div className={`status-projeto ${analise.cor}`}>
                <h4>{analise.status}</h4>
                <p>{analise.explicacao}</p>
              </div>

              <div className="metricas-tabela">
                <table className="tabela-metricas">
                  <tbody>
                    <tr>
                      <td className="metrica-item">
                        <div className="metrica-valor">{analise.tarefas_atrasadas}</div>
                        <div className="metrica-label">{t('messages.delayedTasks')}</div>
                      </td>
                      <td className="metrica-item">
                        <div className="metrica-valor">{analise.dias_restantes}</div>
                        <div className="metrica-label">{t('messages.remainingDays')}</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="metrica-item">
                        <div className="metrica-valor">{analise.tarefas_pendentes}</div>
                        <div className="metrica-label">{t('messages.pendingTasks')}</div>
                      </td>
                      <td className="metrica-item">
                        <div className="metrica-valor">{analise.taxa_conclusao}%</div>
                        <div className="metrica-label">{t('messages.completed')}</div>
                      </td>
                    </tr>
                    {analise.dias_atraso > 0 && (
                      <tr>
                        <td className="metrica-item atraso" colSpan="2">
                          <div className="metrica-valor">{analise.dias_atraso}</div>
                          <div className="metrica-label">{t('messages.daysDelayed')}</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {analise.sugestoes && analise.sugestoes.length > 0 ? (
                <div className="sugestoes-lista">
                  <h4>{t('messages.recommendedSuggestions')}</h4>
                 
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
                        {aplicandoSugestao === sugestao.id ? t('messages.applying') : t('messages.applySuggestion')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sem-sugestoes">
                  <p>{t('messages.noSuggestions')}</p>
                </div>
              )}

              <div className="acoes-finais">
                <button
                  className="btn-reanalisar"
                  onClick={handleAnalisar}
                  disabled={carregando}
                >
                  <img className="icone-reanalisar" src="/imgs/decor-landing/icons-ferramentas/Redo.svg" />
                  &nbsp;{t('messages.reanalyzeProject')}
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