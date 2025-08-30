import { useState, useRef, useEffect } from "react";
import "../styles/ModalForgotPasswordDeleteProject.css"; // reaproveita o CSS
import { useTranslation } from "react-i18next";
import toastService from "../api/toastService";

const ModalDeleteProject = ({ isOpen, onClose, projetoId }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  // Função para deletar o projeto
  const handleDelete = async () => {
    if (input.trim().toUpperCase() !== "SIM") {
      setError(t("modalDeleteProject.errorTypeYes", "Você precisa digitar SIM para confirmar"));
      return;
    }

    try {
      const token = localStorage.getItem("access_token"); // JWT
      const res = await fetch(`/projects/${projetoId}/`, {
        method:'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 204) {
        toastService.success(
            t("toast.deleteProjectSuccessTitle"),
            t("toast.deleteProjectSuccessDetail")
        );
        onClose();
        setInput("");
        setError("");
        // opcional: atualizar lista de projetos no HomeDefault
        } else {
        toastService.error(
            t("toast.deleteProjectErrorTitle"),
            t("toast.deleteProjectErrorDetail")
        );
        }
    } catch (err) {
        toastService.error(
        t("toast.deleteProjectErrorTitle"),
        err.response?.data?.detail || err.message || t("toast.deleteProjectErrorDetail")
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
          <h2>{t("titles.confirmDelete", "Confirmar exclusão")}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <label>
            {t("modalDeleteProject.typeYesToDelete", "Digite")} <b>{t("modalDeleteProject.sim", "SIM")}</b> {t("modalDeleteProject.toDelete", "para apagar o projeto")}
          </label>
          <div className="input-confirm-container">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("modalDeleteProject.inputPlaceholder", "Digite aqui")}
            />
            {error && <p className="input-error">{error}</p>}
            <button className="save-btn" onClick={handleDelete}>
                {t("buttons.confirm", "Confirmar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteProject;
