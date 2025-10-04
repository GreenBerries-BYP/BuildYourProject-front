import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import "../styles/Schedule.css";
import { useTranslation } from "react-i18next";
import { fetchProjectWithTasks, updateTask, updateSubtask } from "../api/api";

const Schedule = ({ projetoId, nomeProjeto, onVoltar }) => {
  const { t } = useTranslation();
  const [phases, setPhases] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [editing, setEditing] = useState(false);
  const [projectDates, setProjectDates] = useState({ startDate: null, endDate: null });

  // Função para gerar timestamp a partir de string ou fallback
  // Função para converter data brasileira para objeto Date
  const parseBrazilianDate = (dateString) => {
    if (!dateString) return null;
    
    // Se já é um objeto Date, retorna diretamente
    if (dateString instanceof Date) return dateString;
    
    // Converte de YYYY-MM-DD (input type="date") para Date
    if (dateString.includes('-')) {
      return new Date(dateString);
    }
    
    // Converte de DD/MM/YYYY para Date
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(year, month - 1, day);
    }
    
    // Fallback para o construtor padrão
    return new Date(dateString);
  };

  const generateProjectDates = (tarefas, projetoStartDate, projetoEndDate) => {
    console.log('Datas recebidas:', projetoStartDate, projetoEndDate);
    
    const start = new Date(projetoStartDate);
    const end = new Date(projetoEndDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const totalProjectDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    console.log(`Prazo do projeto: ${totalProjectDays} dias (${start.toLocaleDateString('pt-BR')} até ${end.toLocaleDateString('pt-BR')})`);

    if (tarefas.length === 0) return [];

    // Distribuição SIMPLES: divide igualmente e a última pega o que sobrou
    const baseDays = Math.floor(totalProjectDays / tarefas.length);
    
    let currentDate = new Date(start);
    
    return tarefas.map((fase, fIdx) => {
      const isLastTask = fIdx === tarefas.length - 1;
      
      const taskStart = new Date(currentDate);
      let taskEnd;
      
      if (isLastTask) {
        // Última tarefa termina exatamente no fim do projeto
        taskEnd = new Date(end);
      } else {
        taskEnd = new Date(taskStart);
        taskEnd.setDate(taskStart.getDate() + baseDays - 1);
      }

      // Calcula subtarefas de forma simples
      const subTarefas = (fase.subTarefas || []).map((sub, sIdx) => {
        const taskDuration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1;
        const subDuration = Math.floor(taskDuration / fase.subTarefas.length);
        
        const subStart = new Date(taskStart);
        subStart.setDate(taskStart.getDate() + sIdx * subDuration);
        
        const subEnd = new Date(subStart);
        subEnd.setDate(subStart.getDate() + subDuration - 1);
        
        if (sIdx === fase.subTarefas.length - 1) {
          subEnd.setTime(taskEnd.getTime());
        }

        return {
          ...sub,
          data_inicio: subStart,
          data_fim: subEnd,
        };
      });

      console.log(`Tarefa ${fIdx + 1}: ${taskStart.toLocaleDateString('pt-BR')} - ${taskEnd.toLocaleDateString('pt-BR')}`);
      
      // Prepara para próxima tarefa
      if (!isLastTask) {
        currentDate = new Date(taskEnd);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return {
        ...fase,
        data_inicio: taskStart,
        data_fim: taskEnd,
        subTarefas,
      };
    });
  };
    // Carrega tarefas do backend respeitando o prazo do projeto
  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        const projeto = await fetchProjectWithTasks(projetoId);

        console.log('Projeto do backend:', projeto);
        console.log('Datas do projeto:', projeto.data_inicio, projeto.data_fim);
        console.log('Tarefas do projeto:', projeto.tarefasProjeto);

        // Salva as datas do projeto (já parseadas)
        if (projeto.data_inicio && projeto.data_fim) {
          setProjectDates({
            startDate: parseBrazilianDate(projeto.data_inicio),
            endDate: parseBrazilianDate(projeto.data_fim)
          });
        }

        let tarefas;
        
        // Se o projeto tem datas definidas, usa a lógica que respeita o prazo
        if (projeto.data_inicio && projeto.data_fim) {
          tarefas = generateProjectDates(
            projeto.tarefasProjeto || [], 
            projeto.data_inicio, 
            projeto.data_fim
          );
        } else {
          // Fallback: usa datas automáticas (comportamento antigo)
          tarefas = (projeto.tarefasProjeto || []).map((fase, fIdx) => {
            const today = new Date();
            const faseInicio = new Date(today);
            faseInicio.setDate(today.getDate() + fIdx * 7);
            
            const faseFim = new Date(faseInicio);
            faseFim.setDate(faseInicio.getDate() + 5);

            const subTarefas = (fase.subTarefas || []).map((sub, sIdx) => {
              const subInicio = new Date(faseInicio);
              subInicio.setDate(faseInicio.getDate() + sIdx);
              
              const subFim = new Date(subInicio);
              subFim.setDate(subInicio.getDate() + 1);
              
              return {
                ...sub,
                data_inicio: subInicio,
                data_fim: subFim,
              };
            });

            return {
              ...fase,
              data_inicio: faseInicio,
              data_fim: faseFim,
              subTarefas,
            };
          });
        }

        setPhases(tarefas);
        formatChartData(tarefas);
      } catch (err) {
        console.error("Erro ao buscar tarefas do projeto:", err);
      }
    };
    carregarTarefas();
  }, [projetoId]);

  const formatChartData = (tasks) => {
    const cores = [
      "#7852b8", "#4ea562", "#8c9399", "#008FFB", "#FEB019",
      "#FF4560", "#775DD0", "#3F51B5", "#546E7A", "#D4526E"
    ];

    const series = tasks.map((fase, fIdx) => {
      const baseColor = cores[fIdx % cores.length];

      const dataFase = [
        {
          x: fase.nomeTarefa || `Fase ${fIdx + 1}`,
          y: [fase.data_inicio.getTime(), fase.data_fim.getTime()],
          fillColor: baseColor,
        },
      ];

      const subData = (fase.subTarefas || []).map((sub) => ({
        x: sub.title || "Subtarefa",
        y: [sub.data_inicio.getTime(), sub.data_fim.getTime()],
        fillColor: baseColor,
      }));

      return { name: fase.nomeTarefa || `Fase ${fIdx + 1}`, data: [...dataFase, ...subData] };
    });

    setChartSeries(series);
  };

  const handleDateChange = (faseIdx, subIdx, field, value) => {
    const novasPhases = [...phases];
    const date = new Date(value);
    if (subIdx === null) {
      novasPhases[faseIdx][field] = date;
    } else {
      novasPhases[faseIdx].subTarefas[subIdx][field] = date;
    }
    setPhases(novasPhases);
    formatChartData(novasPhases);
  };

  const handleSalvar = async () => {
    try {
      for (let fase of phases) {
        await updateTask(projetoId, fase.id, {
          data_inicio: fase.data_inicio.toISOString(),
          data_fim: fase.data_fim.toISOString(),
        });

        for (let sub of fase.subTarefas || []) {
          await updateSubtask(projetoId, sub.id, {
            data_inicio: sub.data_inicio.toISOString(),
            data_fim: sub.data_fim.toISOString(),
          });
        }
      }
      alert("Datas atualizadas com sucesso!");
      setEditing(false);
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("Erro ao salvar alterações!");
    }
  };

  const chartOptions = {
    chart: { type: "rangeBar", height: 350 },
    plotOptions: {
      bar: { horizontal: true, barHeight: "50%", rangeBarGroupRows: true },
    },
    xaxis: { type: "datetime" },
    fill: { type: "solid" },
    legend: { position: "right" },
    tooltip: {
      custom: function (opts) {
        const from = new Date(opts.y1).toLocaleDateString();
        const to = new Date(opts.y2).toLocaleDateString();
        const w = opts.ctx.w;
        const label = w.config.series[opts.seriesIndex].data[opts.dataPointIndex]?.x || "";
        const serie = w.config.series[opts.seriesIndex]?.name || "";
        return `
          <div class="apexcharts-tooltip-rangebar">
            <div><b>${serie}</b></div>
            <div>${label}: ${from} - ${to}</div>
          </div>`;
      },
    },
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>{nomeProjeto}</h2>
        <div className="btns-right">
          {editing ? (
            <button className="salvar-btn" onClick={handleSalvar}>
              {t("buttons.save", "Salvar")}
            </button>
          ) : (
            <button className="editar-btn" onClick={() => setEditing(true)}>
              {t("buttons.edit", "Editar")}
            </button>
          )}
          <button className="fechar-schedule-btn" onClick={onVoltar}>
            {t("buttons.back", "Voltar")}
          </button>
        </div>
      </div>

      <div id="chart">
        {chartSeries.length > 0 && (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="rangeBar"
            height={350}
          />
        )}
      </div>

      <div className="phase-list">
        {phases.map((fase, fIdx) => (
          <div key={fIdx} className="phase-item">
            <h4>{fase.nomeTarefa}</h4>
            <label>
              {t("inputs.startDate", "Início")}{": "}
              <input
                type="date"
                value={fase.data_inicio.toISOString().split("T")[0]}
                onChange={(e) =>
                  handleDateChange(fIdx, null, "data_inicio", e.target.value)
                }
                disabled={!editing}
              />
            </label>
            <label>
              {t("inputs.endDate", "Fim")}{": "}
              <input
                type="date"
                value={fase.data_fim.toISOString().split("T")[0]}
                onChange={(e) =>
                  handleDateChange(fIdx, null, "data_fim", e.target.value)
                }
                disabled={!editing}
              />
            </label>

            {(fase.subTarefas || []).map((sub, sIdx) => (
              <div key={sIdx} className="subtask-item">
                <span>{sub.title}</span>
                <div className="date-container">
                  <label>
                    {t("inputs.startDate", "Início")}{": "}
                    <input
                      type="date"
                      value={sub.data_inicio.toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleDateChange(fIdx, sIdx, "data_inicio", e.target.value)
                      }
                      disabled={!editing}
                    />
                  </label>
                  <label>
                    {t("inputs.endDate", "Fim")}{": "}
                    <input
                      type="date"
                      value={sub.data_fim.toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleDateChange(fIdx, sIdx, "data_fim", e.target.value)
                      }
                      disabled={!editing}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default Schedule;
