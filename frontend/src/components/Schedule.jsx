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
  const parseDate = (dateStr, fallbackDate) => {
    if (!dateStr) return fallbackDate.getTime();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? fallbackDate.getTime() : d.getTime();
  };

  const generateProjectDates = (tarefas, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ajusta para início do dia e final do dia
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const totalProjectMs = end - start;
    const totalProjectDays = Math.ceil(totalProjectMs / (1000 * 60 * 60 * 24));
    
    console.log(`Prazo do projeto: ${totalProjectDays} dias (${start.toDateString()} até ${end.toDateString()})`);

    if (tarefas.length === 0) return [];

    // Calcula a duração disponível por tarefa principal (sem considerar subtarefas)
    const durationPerTask = Math.floor(totalProjectMs / tarefas.length);
    
    console.log(`Duração por tarefa: ${Math.ceil(durationPerTask / (1000 * 60 * 60 * 24))} dias`);
    
    return tarefas.map((fase, fIdx) => {
      // Calcula datas para a tarefa principal
      const taskStart = new Date(start.getTime() + fIdx * durationPerTask);
      let taskEnd = new Date(taskStart.getTime() + durationPerTask - 1);
      
      // Garante que a última tarefa termine exatamente no fim do projeto
      if (fIdx === tarefas.length - 1) {
        taskEnd = new Date(end.getTime());
      }

      // Garante que não ultrapasse o fim do projeto
      if (taskEnd > end) {
        taskEnd = new Date(end.getTime());
      }

      // Calcula datas para subtarefas (se houver)
      const subTarefas = (fase.subTarefas || []).map((sub, sIdx) => {
        const subTaskCount = fase.subTarefas.length;
        
        // Se não há subtarefas, retorna a subtarefa sem modificar datas
        if (subTaskCount === 0) return sub;
        
        // Divide o período da tarefa principal entre as subtarefas
        const taskDurationMs = taskEnd - taskStart;
        const subDuration = Math.floor(taskDurationMs / subTaskCount);
        
        const subStart = new Date(taskStart.getTime() + sIdx * subDuration);
        const subEnd = new Date(subStart.getTime() + subDuration - 1);
        
        // Para a última subtarefa, ajusta para terminar com a tarefa principal
        if (sIdx === subTaskCount - 1) {
          subEnd.setTime(taskEnd.getTime());
        }

        // Garante que não ultrapasse o fim da tarefa principal
        if (subEnd > taskEnd) {
          subEnd.setTime(taskEnd.getTime());
        }

        return {
          ...sub,
          data_inicio: subStart,
          data_fim: subEnd,
        };
      });

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

        // Salva as datas do projeto
        if (projeto.data_inicio && projeto.data_fim) {
          setProjectDates({
            startDate: projeto.data_inicio,
            endDate: projeto.data_fim
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
            const faseInicio = new Date(today.getTime() + fIdx * 7 * 24 * 60 * 60 * 1000);
            const faseFim = new Date(faseInicio.getTime() + 5 * 24 * 60 * 60 * 1000);

            const subTarefas = (fase.subTarefas || []).map((sub, sIdx) => {
              const subInicio = new Date(faseInicio.getTime() + sIdx * 1 * 24 * 60 * 60 * 1000);
              const subFim = new Date(subInicio.getTime() + 1 * 24 * 60 * 60 * 1000);
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
