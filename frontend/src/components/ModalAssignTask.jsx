import { useState, useRef, useEffect } from "react";
import "../styles/ModalNewProject.css"; // reutiliza o CSS do ModalNewProject
import { useTranslation } from "react-i18next";
import toastService from "../api/toastService";

const ModalAssignTask = ({ isOpen, onClose, taskId, onAssignSuccess }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAssign();
    }
  };

  const handleAssign = async () => {
    if (!emailInput.trim()) {
      setEmailError(t("messages.emailCantBeEmpty"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setEmailError(t("messages.invalidEmailFormat"));
      return;
    }

    setLoading(true);
    try {
      // Aqui você deve adaptar para sua API real
      // Exemplo: await api.post(`/tasks/${taskId}/assign`, { email: emailInput });
      await new Promise((res) => setTimeout(res, 500)); // mock

      toastService.success(
        t("toast.assignTaskSuccessTitle"),
        t("toast.assignTaskSuccessDetail")
      );

      onAssignSuccess(emailInput);
      setEmailInput("");
      onClose();
    } catch (err) {
      toastService.error(
        t("toast.assignTaskErrorTitle"),
        err.message || t("toast.assignTaskErrorDetail")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{t("titles.assignTask")}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="input-group">
            <label htmlFor="assignEmail">{t("inputs.collaboratorEmail")}</label>
            <input
              id="assignEmail"
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setEmailError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholders.enterEmail")}
            />
            {emailError && <p className="input-error">{emailError}</p>}
          </div>

          <div className="navigation-buttons">
            <button
              type="button"
              className="save-btn"
              onClick={handleAssign}
              disabled={loading}
            >
              {loading ? t("buttons.saving") : t("buttons.assign")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAssignTask;
