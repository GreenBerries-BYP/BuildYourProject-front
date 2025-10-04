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

  const parseBrazilianDate = (dateString) => {
    if (!dateString) return null;
    
    if (dateString instanceof Date) return dateString;
    
    if (dateString.includes('-')) {
      return new Date(dateString);
    }
    
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(year, month - 1, day);
    }
    
    return new Date(dateString);
  };

  const generateProjectDates = (tarefas, projectStart, projectEnd) => {
    if (!tarefas || tarefas.length === 0) return [];

    const totalDuration = projectEnd.getTime() - projectStart.getTime();
    const taskCount = tarefas.length;
    const durationPerTask = totalDuration / taskCount;

    return tarefas.map((fase, index) => {
      const taskStart = new Date(projectStart.getTime() + (index * durationPerTask));
      const taskEnd = new Date(taskStart.getTime() + durationPerTask);

      const subTarefas = (fase.subTarefas || []).map((sub, subIndex) => {
        const subDuration = durationPerTask / (fase.subTarefas?.length || 1);
        const subStart = new Date(taskStart.getTime() + (subIndex * subDuration));
        const subEnd = new Date(subStart.getTime() + subDuration);

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

  const generateFallbackDates = (tarefas) => {
    return tarefas.map((fase, fIdx) => {
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
  };

  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        // Busca o projeto completo com todas as informações incluindo datas
        const projetoCompleto = await fetchProjectWithTasks(projetoId);

        console.log('Dados completos do projeto:', projetoCompleto);
        
        // Extrai as tarefas do projeto
        const tarefas = projetoCompleto.tarefasProjeto || [];

        console.log('Tarefas do projeto:', tarefas);

        // Busca as datas do projeto - ajuste conforme a estrutura real da sua API
        const startDate = projetoCompleto.start_date || projetoCompleto.startDate;
        const endDate = projetoCompleto.end_date || projetoCompleto.endDate;

        console.log('Datas encontradas:', { startDate, endDate });

        let tarefasComDatas;
        
        if (startDate && endDate) {
          const parsedStart = parseBrazilianDate(startDate);
          const parsedEnd = parseBrazilianDate(endDate);
          
          setProjectDates({
            startDate: parsedStart,
            endDate: parsedEnd
          });

          tarefasComDatas = generateProjectDates(tarefas, parsedStart, parsedEnd);
        } else {
          console.log('Usando fallback - datas automáticas');
          tarefasComDatas = generateFallbackDates(tarefas);
        }

        setPhases(tarefasComDatas);
        formatChartData(tarefasComDatas);
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