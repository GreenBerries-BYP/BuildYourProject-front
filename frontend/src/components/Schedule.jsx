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

  // Função segura para converter datas
  const safeDateConversion = (dateValue, fallback = new Date()) => {
    if (!dateValue) return fallback;
    
    try {
      // Tenta converter data no formato brasileiro (DD/MM/YYYY)
      if (typeof dateValue === 'string' && dateValue.includes('/')) {
        const [day, month, year] = dateValue.split('/');
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? fallback : date;
      }
      
      // Tenta converter como data ISO
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? fallback : date;
    } catch (error) {
      console.warn('Data inválida encontrada:', dateValue, 'usando fallback');
      return fallback;
    }
  };

  // Função para formatar data para input type="date"
  const formatDateForInput = (date) => {
    if (!date || isNaN(date.getTime())) {
      return new Date().toISOString().split("T")[0];
    }
    return date.toISOString().split("T")[0];
  };

  // Gerar datas automaticamente baseado no índice
  const generateAutomaticDates = (tasks, startDate = new Date()) => {
    return tasks.map((task, index) => {
      const taskStart = new Date(startDate);
      taskStart.setDate(startDate.getDate() + (index * 7)); // Cada fase começa 1 semana após a anterior
      
      const taskEnd = new Date(taskStart);
      taskEnd.setDate(taskStart.getDate() + 5); // Duração de 5 dias para cada fase

      const subTarefas = (task.subTarefas || []).map((sub, subIndex) => {
        const subStart = new Date(taskStart);
        subStart.setDate(taskStart.getDate() + subIndex); // Cada subtarefa no dia seguinte
        
        const subEnd = new Date(subStart);
        subEnd.setDate(subStart.getDate() + 1); // Duração de 1 dia para subtarefas

        return {
          ...sub,
          data_inicio: subStart,
          data_fim: subEnd,
        };
      });

      return {
        ...task,
        data_inicio: taskStart,
        data_fim: taskEnd,
        subTarefas,
      };
    });
  };

  useEffect(() => {
    const carregarTarefasComDatas = async () => {
      try {
        const projetoCompleto = await fetchProjectWithTasks(projetoId);
        console.log('Projeto completo:', projetoCompleto);

        // Verificar se temos datas do projeto
        let startDate = safeDateConversion(projetoCompleto.start_date || projetoCompleto.startDate);
        let endDate = safeDateConversion(projetoCompleto.end_date || projetoCompleto.endDate);
        
        // Se não temos datas válidas do projeto, usar datas padrão
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          startDate = new Date();
          endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1); // +1 mês
        }
        
        setProjectDates({ startDate, endDate });

        const tarefas = projetoCompleto.tarefasProjeto || [];
        console.log('Tarefas recebidas:', tarefas);

        // Verificar se as tarefas já têm datas
        let tarefasComDatas;
        
        if (tarefas.length > 0 && tarefas[0].data_inicio) {
          // Se já têm datas, usar as existentes
          tarefasComDatas = tarefas.map(tarefa => ({
            ...tarefa,
            data_inicio: safeDateConversion(tarefa.data_inicio, startDate),
            data_fim: safeDateConversion(tarefa.data_fim, endDate),
            subTarefas: (tarefa.subTarefas || []).map(sub => ({
              ...sub,
              data_inicio: safeDateConversion(sub.data_inicio),
              data_fim: safeDateConversion(sub.data_fim),
            }))
          }));
        } else {
          // Gerar datas automaticamente
          tarefasComDatas = generateAutomaticDates(tarefas, startDate);
        }

        console.log('Tarefas com datas:', tarefasComDatas);
        setPhases(tarefasComDatas);
        formatChartData(tarefasComDatas);
        
      } catch (err) {
        console.error("Erro ao carregar tarefas com datas:", err);
        setPhases([]);
        setChartSeries([]);
      }
    };
    
    carregarTarefasComDatas();
  }, [projetoId]);

  const formatChartData = (tasks) => {
    if (!tasks || tasks.length === 0) {
      setChartSeries([]);
      return;
    }

    const cores = [
      "#7852b8", "#4ea562", "#8c9399", "#008FFB", "#FEB019",
      "#FF4560", "#775DD0", "#3F51B5", "#546E7A", "#D4526E"
    ];

    const series = tasks.map((fase, fIdx) => {
      const baseColor = cores[fIdx % cores.length];

      // Dados da fase principal
      const faseStart = fase.data_inicio.getTime();
      const faseEnd = fase.data_fim.getTime();

      const dataFase = [
        {
          x: fase.nomeTarefa || `Fase ${fIdx + 1}`,
          y: [faseStart, faseEnd],
          fillColor: baseColor,
        },
      ];

      // Dados das subtarefas
      const subData = (fase.subTarefas || []).map((sub, sIdx) => {
        const subStart = sub.data_inicio.getTime();
        const subEnd = sub.data_fim.getTime();

        return {
          x: sub.title || `Subtarefa ${sIdx + 1}`,
          y: [subStart, subEnd],
          fillColor: baseColor,
        };
      });

      return { 
        name: fase.nomeTarefa || `Fase ${fIdx + 1}`, 
        data: [...dataFase, ...subData] 
      };
    });

    console.log('Séries do gráfico:', series);
    setChartSeries(series);
  };

  const handleDateChange = (faseIdx, subIdx, field, value) => {
    const novasPhases = [...phases];
    const date = safeDateConversion(value);
    
    if (subIdx === null) {
      // Alterando data da fase principal
      novasPhases[faseIdx][field] = date;
      
      // Ajustar subtarefas se necessário
      if (field === 'data_inicio') {
        const diff = date.getTime() - novasPhases[faseIdx].data_inicio.getTime();
        novasPhases[faseIdx].subTarefas.forEach(sub => {
          sub.data_inicio = new Date(sub.data_inicio.getTime() + diff);
          sub.data_fim = new Date(sub.data_fim.getTime() + diff);
        });
      }
    } else {
      // Alterando data da subtarefa
      novasPhases[faseIdx].subTarefas[subIdx][field] = date;
    }
    
    setPhases(novasPhases);
    formatChartData(novasPhases);
  };

  const handleSalvar = async () => {
    try {
      for (let fase of phases) {
        if (fase.id) {
          await updateTask(projetoId, fase.id, {
            data_inicio: fase.data_inicio.toISOString(),
            data_fim: fase.data_fim.toISOString(),
          });
        }

        for (let sub of fase.subTarefas || []) {
          if (sub.id) {
            await updateSubtask(projetoId, sub.id, {
              data_inicio: sub.data_inicio.toISOString(),
              data_fim: sub.data_fim.toISOString(),
            });
          }
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
    chart: { 
      type: "rangeBar", 
      height: 350,
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      bar: { 
        horizontal: true, 
        barHeight: "30%", 
        rangeBarGroupRows: true 
      },
    },
    xaxis: { 
      type: "datetime",
      labels: {
        format: 'dd/MM/yyyy'
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    fill: { type: "solid" },
    legend: { 
      position: "right",
      fontSize: '14px'
    },
    tooltip: {
      custom: function (opts) {
        const from = new Date(opts.y1).toLocaleDateString('pt-BR');
        const to = new Date(opts.y2).toLocaleDateString('pt-BR');
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
        <h2>{nomeProjeto} - Cronograma</h2>
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
        {chartSeries.length > 0 ? (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="rangeBar"
            height={400}
          />
        ) : (
          <div className="no-data-message">
            <p>Nenhum dado de cronograma disponível</p>
            <p>Adicione tarefas ao projeto para ver o cronograma</p>
          </div>
        )}
      </div>

      {phases.length > 0 && (
        <div className="phase-list">
          <h3>Editar Datas</h3>
          {phases.map((fase, fIdx) => (
            <div key={fIdx} className="phase-item">
              <h4>{fase.nomeTarefa}</h4>
              <div className="date-inputs">
                <label>
                  {t("inputs.startDate", "Início")}{": "}
                  <input
                    type="date"
                    value={formatDateForInput(fase.data_inicio)}
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
                    value={formatDateForInput(fase.data_fim)}
                    onChange={(e) =>
                      handleDateChange(fIdx, null, "data_fim", e.target.value)
                    }
                    disabled={!editing}
                  />
                </label>
              </div>

              {(fase.subTarefas || []).map((sub, sIdx) => (
                <div key={sIdx} className="subtask-item">
                  <span className="subtask-title">{sub.title}</span>
                  <div className="date-container">
                    <label>
                      {t("inputs.startDate", "Início")}{": "}
                      <input
                        type="date"
                        value={formatDateForInput(sub.data_inicio)}
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
                        value={formatDateForInput(sub.data_fim)}
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
      )}
    </div>
  );
};

export default Schedule;