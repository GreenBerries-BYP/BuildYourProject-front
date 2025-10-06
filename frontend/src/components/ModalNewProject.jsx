import { useEffect, useRef, useState } from "react";
import "../styles/ModalNewProject.css";
import api from "../api/api";
import { useTranslation } from "react-i18next";
import toastService from "../api/toastService";

import { getToken } from "../auth/auth";
import { abntTemplates } from "../mocks/abntMock";
import { createGoogleCalendarEventsForProjectTasks, fetchProjectWithTasks } from "../api/api";

const ModalNewProject = ({ isOpen, onClose, onProjectCreated }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const descriptionTextareaRef = useRef(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "TCC",
    phases: [],
    collaborators: [],
    startDate: "",
    endDate: "",
  });

  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newPhase, setNewPhase] = useState("");
  const [customPhases, setCustomPhases] = useState([]);

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formatDate = (date) => date.toISOString().split("T")[0];

  useEffect(() => {
    const allPhases = abntTemplates.map(t => t.value);
    const abntRequiredPhases = ['capa', 'folha_de_rosto', 'resumo', 'abstract', 'sumario', 'introducao', 'desenvolvimento', 'conclusao', 'referencias'];
    const articlePhases = ['introducao', 'desenvolvimento', 'conclusao', 'referencias'];

    let newPhases = [];
    if (formData.type === 'TCC') {
      newPhases = allPhases;
    } else if (formData.type === 'ABNT') {
      newPhases = abntRequiredPhases;
    } else if (formData.type === t('inputs.academicArticle')) {
      newPhases = articlePhases;
    }

    // Evita loop infinito, atualizando o estado apenas se as fases forem diferentes
    if (JSON.stringify(formData.phases) !== JSON.stringify(newPhases)) {
      setFormData(prev => ({ ...prev, phases: newPhases }));
    }
  }, [formData.type, t, formData.phases]);

  const waitForTasksAndCreateEvents = async (projetoId, nomeProjeto, projetoStartDate, projetoEndDate, maxAttempts = 10) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`Verificando tarefas do projeto (tentativa ${attempt + 1})...`);
        const projetoComTarefas = await fetchProjectWithTasks(projetoId);

        if (projetoComTarefas.tarefasProjeto && projetoComTarefas.tarefasProjeto.length > 0) {
          console.log(`Encontradas ${projetoComTarefas.tarefasProjeto.length} tarefas`);
          const tarefasComDatasGeradas = generateProjectDates(
            projetoComTarefas.tarefasProjeto,
            projetoStartDate,
            projetoEndDate
          );
          console.log(`Datas geradas para ${tarefasComDatasGeradas.length} tarefas respeitando o prazo do projeto`);
          await createGoogleCalendarEventsForProjectTasks(projetoId, nomeProjeto, tarefasComDatasGeradas);
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Erro na tentativa ${attempt + 1}:`, error);
      }
    }
    console.log("Timeout: tarefas não foram geradas a tempo");
    return false;
  };

  const generateProjectDates = (tarefas, projetoStartDate, projetoEndDate) => {
    const start = new Date(projetoStartDate);
    const end = new Date(projetoEndDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const totalProjectMs = end - start;
    if (tarefas.length === 0) return [];
    const durationPerTask = Math.floor(totalProjectMs / tarefas.length);

    return tarefas.map((fase, fIdx) => {
      const taskStart = new Date(start.getTime() + fIdx * durationPerTask);
      let taskEnd = new Date(taskStart.getTime() + durationPerTask);
      if (fIdx === tarefas.length - 1) {
        taskEnd = new Date(end.getTime());
      }
      if (taskEnd > end) {
        taskEnd = new Date(end.getTime());
      }
      return { ...fase, data_inicio: taskStart, data_fim: taskEnd };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "description") {
      setTimeout(() => autoResizeTextarea(descriptionTextareaRef.current), 0);
    }
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type: type }));
    if (formErrors.type) {
      setFormErrors((prev) => ({ ...prev, type: "" }));
    }
  };

  const handlephasesChange = (selectedphasesValue) => {
    setFormData((prevData) => {
      const currentphasess = prevData.phases;
      if (currentphasess.includes(selectedphasesValue)) {
        return { ...prevData, phases: currentphasess.filter((tmpl) => tmpl !== selectedphasesValue) };
      } else {
        return { ...prevData, phases: [...currentphasess, selectedphasesValue] };
      }
    });
  };

  const handleCollaboratorChange = (newColaboradores) => {
    setFormData((prev) => ({ ...prev, collaborators: newColaboradores }));
  };

  const adicionarColaborador = () => {
    if (!emailInput.trim()) {
      setEmailError(t("messages.emailCantBeEmpty"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setEmailError(t("messages.invalidEmailFormat"));
      return;
    }
    if (formData.collaborators.includes(emailInput)) {
      setEmailError(t("messages.emailAlreadyAdded"));
      return;
    }
    handleCollaboratorChange([...formData.collaborators, emailInput]);
    setEmailInput("");
    setEmailError("");
  };

  const removerColaborador = (email) => {
    handleCollaboratorChange(formData.collaborators.filter((e) => e !== email));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionarColaborador();
    }
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = t("messages.projectNameRequired");
    if (!formData.description.trim()) errors.description = t("messages.projectDescriptionRequired");
    if (!formData.startDate) errors.startDate = t("messages.startDateRequired");
    if (!formData.endDate) errors.endDate = t("messages.endDateRequired");
    else if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        errors.endDate = t("messages.endDateAfterStartDate");
      }
    }
    return errors;
  };

  const nextStep = () => {
    let currentStepErrors = {};
    const allErrors = validateForm();
    if (currentStep === 1) {
      if (allErrors.name) currentStepErrors.name = allErrors.name;
      if (allErrors.description) currentStepErrors.description = allErrors.description;
    } else if (currentStep === 2) {
      if (allErrors.startDate) currentStepErrors.startDate = allErrors.startDate;
      if (allErrors.endDate) currentStepErrors.endDate = allErrors.endDate;
    }
    if (Object.keys(currentStepErrors).length > 0) {
      setFormErrors((prevErrors) => ({ ...prevErrors, ...currentStepErrors }));
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== 3) {
      nextStep();
      return;
    }

    const allErrors = validateForm();
    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      if (allErrors.name || allErrors.description) setCurrentStep(1);
      else if (allErrors.startDate || allErrors.endDate) setCurrentStep(2);
      return;
    }

    setFormErrors({});
    setLoading(true);
    try {
      const token = getToken();
      const submissionData = { ...formData };
      const response = await api.post("/projetos/", submissionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status >= 200 && response.status < 300) {
        const novoProjeto = response.data;
        toastService.success(t("toast.createProjectSuccessTitle"), t("toast.createProjectSuccessDetail"));
        waitForTasksAndCreateEvents(novoProjeto.id, novoProjeto.name, formData.startDate, formData.endDate)
          .then(success => {
            if (success) {
              toastService.success("Eventos criados!", "Os eventos foram adicionados ao Google Calendar");
            }
          });
        if (onProjectCreated) onProjectCreated();
        onClose();
      } else {
        throw new Error(response.data.detail || t("messages.errorNewProject"));
      }
    } catch (err) {
      toastService.error(t("toast.createProjectErrorTitle"), err.message || t("toast.createProjectErrorDetail"));
    } finally {
      setLoading(false);
    }
  };

  const autoResizeTextarea = (element) => {
    if (element) {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        name: "", description: "", type: "TCC", phases: abntTemplates.map(t => t.value),
        collaborators: [], startDate: "", endDate: "",
      });
      setCurrentStep(1);
      setFormErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const projectTypes = ["TCC", t("inputs.academicArticle"), "ABNT", t("inputs.other")];

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{t("titles.newProject")}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="step-indicator">
            <div className={`step-item ${currentStep === 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
              <span className="step-number">1</span>
              <span className="step-label">{t("steps.basicInfo")}</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step-item ${currentStep === 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
              <span className="step-number">2</span>
              <span className="step-label">{t("steps.datesAndCollaborators")}</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step-item ${currentStep === 3 ? "active" : ""}`}>
              <span className="step-number">3</span>
              <span className="step-label">{t("steps.review")}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            {currentStep === 1 && (
              <div>
                <h3>{t("titles.step1BasicInfo")}</h3>
                <div className="form-grid">
                  <div className="form-left">
                    <div className="input-group">
                      <label htmlFor="projectName">{t("inputs.name")}</label>
                      <input id="projectName" name="name" placeholder={t("placeholders.projectName")} value={formData.name} onChange={handleChange} />
                      {formErrors.name && <p className="input-error">{formErrors.name}</p>}
                    </div>
                    <div className={`input-group floating-label-group ${formData.description ? "has-value" : ""} ${formErrors.description ? "has-error" : ""}`} onClick={() => descriptionTextareaRef.current?.focus()}>
                      <textarea id="projectDescription" name="description" value={formData.description} onChange={handleChange} ref={descriptionTextareaRef} rows="4" />
                      <label htmlFor="projectDescription">{t("inputs.description")}</label>
                      <div className="char-counter-footer"><span>{formData.description.length} / 500</span></div>
                    </div>
                    {formErrors.description && <p className="input-error" style={{ marginTop: "-0.5rem" }}>{formErrors.description}</p>}
                  </div>
                  <div className="form-right">
                    <div className="form-options">
                      <div className="project-type">
                        <label>{t("inputs.projectType")}</label>
                        <div className="options">
                          {projectTypes.map((type) => (
                            <button key={type} type="button" onClick={() => handleTypeChange(type)} className={formData.type === type ? "selected" : ""}>{type}</button>
                          ))}
                        </div>
                      </div>
                      <div className="phases mt-4">
                        <label htmlFor="projectphases">{t("inputs.phases")}</label>
                        <div className="options">
                          <div className="addOwnPhase">
                            <input type="text" value={newPhase} onChange={(e) => setNewPhase(e.target.value)} placeholder={t("inputs.addCustomPhase")} />
                            <button id="addPhaseButton" type="button" onClick={(e) => { e.preventDefault(); if (newPhase.trim() !== "" && !formData.phases.includes(newPhase)) { handlephasesChange(newPhase); setCustomPhases((prev) => [...prev, newPhase]); setNewPhase(""); } }}>{t("inputs.addPhase")}</button>
                          </div>
                          {[...abntTemplates, ...customPhases.map((p) => ({ value: p, label: p }))].map((tmpl) => (
                            <button key={tmpl.value} type="button" onClick={() => handlephasesChange(tmpl?.value)} className={formData.phases.includes(tmpl?.value) ? "selected" : ""}>{t(tmpl?.label)}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h3>{t("titles.step2DatesAndCollabs")}</h3>
                <div className="form-grid">
                  <div className="form-left">
                    <div className="input-group">
                      <label htmlFor="startDate">{t("inputs.startDate")}</label>
                      <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} min={formatDate(oneMonthAgo)} max={formatDate(today)} />
                      {formErrors.startDate && <p className="input-error">{formErrors.startDate}</p>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="endDate">{t("inputs.endDate")}</label>
                      <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
                      {formErrors.endDate && <p className="input-error">{formErrors.endDate}</p>}
                    </div>
                  </div>
                  <div className="form-right">
                    <h4>{t("titles.collaborators")}</h4>
                    <div className="input-group">
                      <input id="collaboratorEmail" type="email" placeholder={t("messages.emailMessage")} value={emailInput} onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }} onKeyDown={handleKeyDown} />
                    </div>
                    {emailError && <p className="input-error" style={{ marginTop: "0.5rem" }}>{emailError}</p>}
                    <div className="email-list">
                      {formData.collaborators.map((email) => (
                        <span key={email} className="email-chip">{email}<button type="button" onClick={() => removerColaborador(email)}>×</button></span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div>
                <h3>{t("titles.step3Review")}</h3>
                <p className="review-intro-message">{t("messages.reviewProjectDetails")}</p>
                <div className="review-grid">
                  <div className="review-section">
                    <h4>{t("titles.projectDetails")}</h4>
                    <p><strong>{t("inputs.name")}:</strong> {formData.name || t("messages.notSpecified")}</p>
                    <div className="review-item review-description-wrapper">
                      <p style={{ marginBottom: "0.5rem" }}><strong>{t("inputs.descriptionShort")}:</strong></p>
                      <div className={`review-description-content ${isDescriptionExpanded ? "expanded" : "collapsed"}`}>{formData.description || t("messages.notSpecified")}</div>
                      {formData.description && formData.description.length > 150 && (<button type="button" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="toggle-description-btn">{isDescriptionExpanded ? t("buttons.readLess") : t("buttons.readMore")}</button>)}
                    </div>
                    <p><strong>{t("inputs.projectType")}:</strong> {t(formData.type) || t("messages.notSpecified")}</p>
                    <p><strong>{t("inputs.phases")}:</strong> {formData.phases.length > 0 ? formData.phases.map((value) => { const template = abntTemplates.find((tmpl) => tmpl?.value === value); return template ? t(template.label) : value; }).join(", ") : t("messages.notSpecified")}</p>
                  </div>
                  <div className="review-section">
                    <h4>{t("titles.datesAndCollaborators")}</h4>
                    <p><strong>{t("inputs.startDate")}:</strong> {formData.startDate || t("messages.notSpecified")}</p>
                    <p><strong>{t("inputs.endDate")}:</strong> {formData.endDate || t("messages.notSpecified")}</p>
                    <p><strong>{t("titles.collaborators")}:</strong></p>
                    {formData.collaborators.length > 0 ? (<ul className="review-collaborators-list">{formData.collaborators.map((email) => (<li key={email}>{email}</li>))}</ul>) : (<p>{t("messages.noCollaborators")}</p>)}
                  </div>
                </div>
              </div>
            )}
            <div className="navigation-buttons">
              {currentStep > 1 && (<button type="button" className="prev-btn" onClick={prevStep}>{t("buttons.previous")}</button>)}
              {currentStep < 3 && (<button type="button" className="next-btn" onClick={nextStep}>{t("buttons.next")}</button>)}
              {currentStep === 3 && (<button type="submit" className="save-btn" disabled={loading}>{loading ? t("buttons.saving") : t("buttons.createProject")}</button>)}
            </div>
            {formErrors.submit && <p className="input-error center" style={{ marginTop: "10px" }}>{formErrors.submit}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalNewProject;
