import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createGoogleCalendarEvent } from "../api/api";
import { getToken } from "../auth/auth";
import "../styles/ModalNewTask.css"; // Reutiliza os mesmos estilos

const ModalNewCalendarEvent = ({ isOpen, onClose, onEventCreated }) => {
  const modalRef = useRef();
  const { t } = useTranslation();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [dataFim, setDataFim] = useState("");
  const [horaFim, setHoraFim] = useState("10:00");
  const [local, setLocal] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validação do formulário
  const validateForm = () => {
    const errors = {};
    if (!titulo.trim()) errors.titulo = "Título do evento é obrigatório";
    if (!dataInicio) errors.dataInicio = "Data de início é obrigatória";
    if (!dataFim) errors.dataFim = "Data de término é obrigatória";
    
    // Validar se data fim é depois da data início
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio + 'T' + (horaInicio || '00:00'));
      const fim = new Date(dataFim + 'T' + (horaFim || '00:00'));
      if (fim <= inicio) {
        errors.dataFim = "Data de término deve ser após a data de início";
      }
    }
    
    return errors;
  };

  // Submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Criar objetos de data/hora no formato ISO
    const startDateTime = new Date(dataInicio + 'T' + horaInicio + ':00').toISOString();
    const endDateTime = new Date(dataFim + 'T' + horaFim + ':00').toISOString();

    const evento = {
      summary: titulo,
      description: descricao,
      location: local,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Sao_Paulo'
      },
      reminders: {
        useDefault: true
      }
    };

    setLoading(true);
    try {
      await createGoogleCalendarEvent(evento);
      
      if (onEventCreated) onEventCreated();
      onClose();
    } catch (err) {
      console.error("Erro ao criar evento:", err);
      setFormErrors({ submit: err.message || "Erro ao criar evento no Google Calendar" });
    } finally {
      setLoading(false);
    }
  };

  // Quando data início muda, setar data fim igual (se vazia)
  useEffect(() => {
    if (dataInicio && !dataFim) {
      setDataFim(dataInicio);
    }
  }, [dataInicio, dataFim]);

  // Resetar campos ao abrir/fechar modal
  useEffect(() => {
    if (!isOpen) {
      setTitulo("");
      setDescricao("");
      setDataInicio("");
      setHoraInicio("09:00");
      setDataFim("");
      setHoraFim("10:00");
      setLocal("");
      setFormErrors({});
    }
  }, [isOpen]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Fechar modal clicando fora
  useEffect(() => {
    const handleClickOutside = (e) => { 
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); 
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>Novo Evento no Calendar</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2x2">
              <div className="input-group">
                <label>Título do Evento *</label>
                <input
                  placeholder="Digite o título do evento"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                {formErrors.titulo && <p className="input-error">{formErrors.titulo}</p>}
              </div>

              <div className="input-group">
                <label>Local</label>
                <input
                  placeholder="Local do evento (opcional)"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Data de Início *</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.dataInicio && <p className="input-error">{formErrors.dataInicio}</p>}
              </div>

              <div className="input-group">
                <label>Hora de Início</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Data de Término *</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  min={dataInicio || new Date().toISOString().split('T')[0]}
                />
                {formErrors.dataFim && <p className="input-error">{formErrors.dataFim}</p>}
              </div>

              <div className="input-group">
                <label>Hora de Término</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                />
              </div>

              <div className="input-group full-width">
                <label>Descrição</label>
                <textarea
                  placeholder="Descrição do evento (opcional)"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows="3"
                />
              </div>
            </div>

            {formErrors.submit && <p className="input-error center">{formErrors.submit}</p>}

            <div className="save-wrapper">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Criando..." : "Criar Evento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalNewCalendarEvent;