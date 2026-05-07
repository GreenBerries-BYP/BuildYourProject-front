import { useEffect, useRef, useState } from "react";
import "../styles/ModalNewProject.css";
import api from "../api/api";
import { useTranslation } from "react-i18next";
import toastService from "../api/toastService";

import { getToken } from "../auth/auth";
import { abntTemplates } from "../mocks/abntMock";
import {
  createGoogleCalendarEventsForProjectTasks,
  fetchProjectWithTasks,
} from "../api/api";

const ModalNewProject = ({ isOpen, onClose, onProjectCreated }) => {
  const { t } = useTranslation();

  const modalRef = useRef();
  const descriptionTextareaRef = useRef(null);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const PROJECT_TEMPLATES = {
    TCC: abntTemplates.map((template) => template.value),

    ABNT: [
      "capa",
      "folha_de_rosto",
      "resumo",
      "abstract",
      "sumario",
      "introducao",
      "desenvolvimento",
      "conclusao",
      "referencias",
    ],

    ARTICLE: [
      "introducao",
      "desenvolvimento",
      "conclusao",
      "referencias",
    ],

    OTHER: [],
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "TCC",
    phases: PROJECT_TEMPLATES.TCC,
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
    if (!PROJECT_TEMPLATES[formData.type]) return;

    setFormData((prev) => {
      const templatePhases = PROJECT_TEMPLATES[formData.type];

      const preservedCustomPhases = prev.phases.filter(
        (phase) =>
          !Object.values(PROJECT_TEMPLATES)
            .flat()
            .includes(phase)
      );

      return {
        ...prev,
        phases: [...templatePhases, ...preservedCustomPhases],
      };
    });
  }, [formData.type]);

  const waitForTasksAndCreateEvents = async (
    projetoId,
    nomeProjeto,
    projetoStartDate,
    projetoEndDate,
    maxAttempts = 10
  ) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(
          `Verificando tarefas do projeto (tentativa ${
            attempt + 1
          })...`
        );

        const projetoComTarefas =
          await fetchProjectWithTasks(projetoId);

        if (
          projetoComTarefas.tarefasProjeto &&
          projetoComTarefas.tarefasProjeto.length > 0
        ) {
          console.log(
            `Encontradas ${projetoComTarefas.tarefasProjeto.length} tarefas`
          );

          const tarefasComDatasGeradas = generateProjectDates(
            projetoComTarefas.tarefasProjeto,
            projetoStartDate,
            projetoEndDate
          );

          console.log(
            `Datas geradas para ${tarefasComDatasGeradas.length} tarefas respeitando o prazo do projeto`
          );

          await createGoogleCalendarEventsForProjectTasks(
            projetoId,
            nomeProjeto,
            tarefasComDatasGeradas
          );

          return true;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );
      } catch (error) {
        console.error(
          `Erro na tentativa ${attempt + 1}:`,
          error
        );
      }
    }

    console.log("Timeout: tarefas não foram geradas a tempo");

    return false;
  };

  const generateProjectDates = (
    tarefas,
    projetoStartDate,
    projetoEndDate
  ) => {
    const start = new Date(projetoStartDate);
    const end = new Date(projetoEndDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const totalProjectMs = end - start;

    if (tarefas.length === 0) return [];

    const durationPerTask = Math.floor(
      totalProjectMs / tarefas.length
    );

    return tarefas.map((fase, fIdx) => {
      const taskStart = new Date(
        start.getTime() + fIdx * durationPerTask
      );

      let taskEnd = new Date(
        taskStart.getTime() + durationPerTask
      );

      if (fIdx === tarefas.length - 1) {
        taskEnd = new Date(end.getTime());
      }

      if (taskEnd > end) {
        taskEnd = new Date(end.getTime());
      }

      return {
        ...fase,
        data_inicio: taskStart,
        data_fim: taskEnd,
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "description") {
      setTimeout(
        () =>
          autoResizeTextarea(
            descriptionTextareaRef.current
          ),
        0
      );
    }
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));

    if (formErrors.type) {
      setFormErrors((prev) => ({
        ...prev,
        type: "",
      }));
    }
  };

  const handlephasesChange = (selectedphasesValue) => {
    setFormData((prevData) => {
      const currentphasess = prevData.phases;

      if (
        currentphasess.includes(selectedphasesValue)
      ) {
        return {
          ...prevData,
          phases: currentphasess.filter(
            (tmpl) => tmpl !== selectedphasesValue
          ),
        };
      }

      return {
        ...prevData,
        phases: [
          ...currentphasess,
          selectedphasesValue,
        ],
      };
    });
  };

  const handleCollaboratorChange = (
    newColaboradores
  ) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: newColaboradores,
    }));
  };

  const adicionarColaborador = () => {
    if (!emailInput.trim()) {
      setEmailError(
        t("messages.emailCantBeEmpty")
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)
    ) {
      setEmailError(
        t("messages.invalidEmailFormat")
      );

      return;
    }

    if (
      formData.collaborators.includes(emailInput)
    ) {
      setEmailError(
        t("messages.emailAlreadyAdded")
      );

      return;
    }

    handleCollaboratorChange([
      ...formData.collaborators,
      emailInput,
    ]);

    setEmailInput("");
    setEmailError("");
  };

  const removerColaborador = (email) => {
    handleCollaboratorChange(
      formData.collaborators.filter(
        (e) => e !== email
      )
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionarColaborador();
    }
  };

  const prevStep = () =>
    setCurrentStep((prev) => prev - 1);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t(
        "messages.projectNameRequired"
      );
    }

    if (!formData.description.trim()) {
      errors.description = t(
        "messages.projectDescriptionRequired"
      );
    }

    if (!formData.startDate) {
      errors.startDate = t(
        "messages.startDateRequired"
      );
    }

    if (!formData.endDate) {
      errors.endDate = t(
        "messages.endDateRequired"
      );
    } else if (
      formData.startDate &&
      formData.endDate
    ) {
      if (
        new Date(formData.endDate) <
        new Date(formData.startDate)
      ) {
        errors.endDate = t(
          "messages.endDateAfterStartDate"
        );
      }
    }

    return errors;
  };

  const nextStep = () => {
    let currentStepErrors = {};

    const allErrors = validateForm();

    if (currentStep === 1) {
      if (allErrors.name) {
        currentStepErrors.name =
          allErrors.name;
      }

      if (allErrors.description) {
        currentStepErrors.description =
          allErrors.description;
      }
    } else if (currentStep === 2) {
      if (allErrors.startDate) {
        currentStepErrors.startDate =
          allErrors.startDate;
      }

      if (allErrors.endDate) {
        currentStepErrors.endDate =
          allErrors.endDate;
      }
    }

    if (
      Object.keys(currentStepErrors).length > 0
    ) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        ...currentStepErrors,
      }));

      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const autoResizeTextarea = (element) => {
    if (element) {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        type: "TCC",
        phases: PROJECT_TEMPLATES.TCC,
        collaborators: [],
        startDate: "",
        endDate: "",
      });

      setCurrentStep(1);
      setFormErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const projectTypes = [
    {
      value: "TCC",
      label: "TCC",
    },
    {
      value: "ARTICLE",
      label: t("inputs.academicArticle"),
    },
    {
      value: "ABNT",
      label: "ABNT",
    },
    {
      value: "OTHER",
      label: t("inputs.other"),
    },
  ];

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        ref={modalRef}
      >
        <div className="modal-header">
          <h2>{t("titles.newProject")}</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="step-indicator">
            <div
              className={`step-item ${
                currentStep === 1
                  ? "active"
                  : ""
              } ${
                currentStep > 1
                  ? "completed"
                  : ""
              }`}
            >
              <span className="step-number">
                1
              </span>

              <span className="step-label">
                {t("steps.basicInfo")}
              </span>
            </div>

            <div className="step-connector"></div>

            <div
              className={`step-item ${
                currentStep === 2
                  ? "active"
                  : ""
              } ${
                currentStep > 2
                  ? "completed"
                  : ""
              }`}
            >
              <span className="step-number">
                2
              </span>

              <span className="step-label">
                {t(
                  "steps.datesAndCollaborators"
                )}
              </span>
            </div>

            <div className="step-connector"></div>

            <div
              className={`step-item ${
                currentStep === 3
                  ? "active"
                  : ""
              }`}
            >
              <span className="step-number">
                3
              </span>

              <span className="step-label">
                {t("steps.review")}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            {currentStep === 1 && (
              <div>
                <h3>
                  {t("titles.step1BasicInfo")}
                </h3>

                <div className="form-grid">
                  <div className="form-left">
                    <div className="input-group">
                      <label htmlFor="projectName">
                        {t("inputs.name")}
                      </label>

                      <input
                        id="projectName"
                        name="name"
                        placeholder={t(
                          "placeholders.projectName"
                        )}
                        value={formData.name}
                        onChange={handleChange}
                      />

                      {formErrors.name && (
                        <p className="input-error">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div
                      className={`input-group floating-label-group ${
                        formData.description
                          ? "has-value"
                          : ""
                      } ${
                        formErrors.description
                          ? "has-error"
                          : ""
                      }`}
                      onClick={() =>
                        descriptionTextareaRef.current?.focus()
                      }
                    >
                      <textarea
                        id="projectDescription"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        ref={
                          descriptionTextareaRef
                        }
                        rows="4"
                      />

                      <label htmlFor="projectDescription">
                        {t("inputs.description")}
                      </label>

                      <div className="char-counter-footer">
                        <span>
                          {
                            formData.description
                              .length
                          }{" "}
                          / 500
                        </span>
                      </div>
                    </div>

                    {formErrors.description && (
                      <p
                        className="input-error"
                        style={{
                          marginTop: "-0.5rem",
                        }}
                      >
                        {
                          formErrors.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="form-right">
                    <div className="form-options">
                      <div className="project-type">
                        <label>
                          {t(
                            "inputs.projectType"
                          )}
                        </label>

                        <div className="options">
                          {projectTypes.map(
                            (type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() =>
                                  handleTypeChange(
                                    type.value
                                  )
                                }
                                className={
                                  formData.type ===
                                  type.value
                                    ? "selected"
                                    : ""
                                }
                              >
                                {type.label}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalNewProject;