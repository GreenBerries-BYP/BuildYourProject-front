import { useState, useRef, useEffect } from "react";
import "../styles/ModalForgotPasswordDeleteProject.css"; // reaproveita o CSS
import { useTranslation } from "react-i18next";
import toastService from "../api/toastService";

const ModalDeleteTask = ({ isOpen, onClose, taskId, onDeleteSuccess }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const API_URL = "https://byp-backend-o4ku.onrender.com/api";

  // Função para deletar a tarefa
  const handleDelete = async () => {
    if (input.trim().toUpperCase() !== "SIM") {
      setError(t("modalDeleteTask.errorTypeYes"));
      return;
    }

    try {
      const token = localStorage.getItem("access_token"); // JWT
      const res = await fetch(`${API_URL}/tarefas/${taskId}/`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.status === 204) {
        toastService.success(
          t("toast.deleteTaskSuccessTitle"),
          t("toast.deleteTaskSuccessDetail")
        );
        onClose();
        setInput("");
        setError("");

        if (onDeleteSuccess) {
          onDeleteSuccess(taskId);
        }
      } else {
        toastService.error(
          t("toast.deleteTaskErrorTitle"),
          t("toast.deleteTaskErrorDetail")
        );
      }
    } catch (err) {
      toastService.error(
        t("toast.deleteTaskErrorTitle"),
        err.response?.data?.detail || err.message || t("toast.deleteTaskErrorDetail")
      );
    }
  };

  // Fecha modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Fecha modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{t("titles.confirmDelete")}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <label>
            {t("modalDeleteTask.typeYesToDelete")} <b>{t("modalDeleteTask.sim")}</b> {t("modalDeleteTask.toDelete")}
          </label>
          <div className="input-confirm-container">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("modalDeleteTask.inputPlaceholder")}
            />
            {error && <p className="input-error">{error}</p>}
            <button className="save-btn" onClick={handleDelete}>
              {t("buttons.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteTask;
