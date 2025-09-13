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

  // Função para gerar timestamp a partir de string ou fallback
  const parseDate = (dateStr, fallbackDate) => {
    if (!dateStr) return fallbackDate.getTime();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? fallbackDate.getTime() : d.getTime();
  };

  // Gera datas automáticas para fases/subtasks
  const generateSystemDates = (faseIdx, subIdx) => {
    const today = new Date();
    const faseInicio = new Date(today.getTime() + faseIdx * 7 * 24 * 60 * 60 * 1000); // +7 dias por fase
    const faseFim = new Date(faseInicio.getTime() + 5 * 24 * 60 * 60 * 1000); // duração 5 dias
    if (subIdx === null) return { data_inicio: faseInicio, data_fim: faseFim };
    // Subtarefa dentro da fase
    const subInicio = new Date(faseInicio.getTime() + subIdx * 1 * 24 * 60 * 60 * 1000);
    const subFim = new Date(subInicio.getTime() + 1 * 24 * 60 * 60 * 1000);
    return { data_inicio: subInicio, data_fim: subFim };
  };

  // Carrega tarefas do backend (ou datas automáticas)
  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        const projeto = await fetchProjectWithTasks(projetoId);

        const tarefas = (projeto.tarefasProjeto || []).map((fase, fIdx) => {
          const { data_inicio, data_fim } = generateSystemDates(fIdx, null);

          const subTarefas = (fase.subTarefas || []).map((sub, sIdx) => {
            const subDates = generateSystemDates(fIdx, sIdx);
            return {
              ...sub,
              data_inicio: subDates.data_inicio,
              data_fim: subDates.data_fim,
            };
          });

          return {
            ...fase,
            data_inicio,
            data_fim,
            subTarefas,
          };
        });

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
              Salvar
            </button>
          ) : (
            <button className="editar-btn" onClick={() => setEditing(true)}>
              Editar
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

      {editing && (
        <div className="phase-list">
          {phases.map((fase, fIdx) => (
            <div key={fIdx} className="phase-item">
              <h4>{fase.nomeTarefa}</h4>
              <label>
                Início:{" "}
                <input
                  type="date"
                  value={fase.data_inicio.toISOString().split("T")[0]}
                  onChange={(e) =>
                    handleDateChange(fIdx, null, "data_inicio", e.target.value)
                  }
                />
              </label>
              <label>
                Fim:{" "}
                <input
                  type="date"
                  value={fase.data_fim.toISOString().split("T")[0]}
                  onChange={(e) =>
                    handleDateChange(fIdx, null, "data_fim", e.target.value)
                  }
                />
              </label>

              {(fase.subTarefas || []).map((sub, sIdx) => (
                <div key={sIdx} className="subtask-item">
                  <span>{sub.title}</span>
                  <label>
                    Início:{" "}
                    <input
                      type="date"
                      value={sub.data_inicio.toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleDateChange(fIdx, sIdx, "data_inicio", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Fim:{" "}
                    <input
                      type="date"
                      value={sub.data_fim.toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleDateChange(fIdx, sIdx, "data_fim", e.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
