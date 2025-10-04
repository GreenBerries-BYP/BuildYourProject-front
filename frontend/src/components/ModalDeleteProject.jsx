// src/components/ModalDeleteProject.jsx
import { useState, useRef, useEffect } from "react";
import "../styles/ModalForgotPasswordDeleteProject.css";
import { useTranslation } from "react-i18next";
import toastService from "../api/toastService";
import { getToken } from "../auth/auth";

const ModalDeleteProject = ({
  isOpen,
  onClose,
  projetoId,
  onDeleteSuccess,
}) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const API_URL = "https://byp-backend-o4ku.onrender.com/api";

  // Função para deletar o projeto
  const handleDelete = async () => {
    if (input.trim().toUpperCase() !== "SIM") {
      setError(
        t(
          "modalDeleteProject.errorTypeYes",
          "Você precisa digitar SIM para confirmar"
        )
      );
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        toastService.error(
          t("toast.authErrorTitle", "Erro de autenticação"),
          t("toast.authErrorDetail", "Token inválido. Por favor, faça login novamente.")
        );
        onClose();
        return;
      }

      const res = await fetch(`${API_URL}/projetos/${projetoId}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        toastService.success(
          t("toast.deleteProjectSuccessTitle", "Projeto excluído"),
          t("toast.deleteProjectSuccessDetail", "Projeto excluído com sucesso!")
        );
        
        // Limpa o input e fecha o modal
        setInput("");
        setError("");
        onClose();

        // Chama o callback de sucesso se existir
        if (onDeleteSuccess) {
          onDeleteSuccess(projetoId);
        }
        
      } else if (res.status === 401) {
        // Token expirado ou inválido
        toastService.error(
          t("toast.authErrorTitle", "Erro de autenticação"),
          t("toast.sessionExpired", "Sua sessão expirou. Faça login novamente.")
        );
        // Remove token inválido
        localStorage.removeItem("access_token");
        // Opcional: redirecionar para login
        // window.location.href = '/login';
        
      } else if (res.status === 403) {
        // Sem permissão
        toastService.error(
          t("toast.permissionErrorTitle", "Sem permissão"),
          t("toast.deleteProjectPermissionError", "Você não tem permissão para excluir este projeto.")
        );
      } else if (res.status === 404) {
        // Projeto não encontrado
        toastService.error(
          t("toast.projectNotFoundTitle", "Projeto não encontrado"),
          t("toast.projectNotFoundDetail", "O projeto que você tentou excluir não existe.")
        );
      } else {
        // Outros erros
        const errorData = await res.json().catch(() => ({}));
        toastService.error(
          t("toast.deleteProjectErrorTitle", "Erro ao excluir"),
          errorData.detail || 
          errorData.message || 
          t("toast.deleteProjectErrorDetail", "Erro ao excluir o projeto. Tente novamente.")
        );
      }
    } catch (err) {
      console.error('Erro ao deletar projeto:', err);
      toastService.error(
        t("toast.deleteProjectErrorTitle", "Erro ao excluir"),
        t("toast.deleteProjectErrorDetail", "Erro ao excluir o projeto. Tente novamente.")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Fecha modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fecha modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Limpa estados quando o modal abre/fecha
  useEffect(() => {
    if (!isOpen) {
      setInput("");
      setError("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{t("titles.confirmDelete", "Confirmar exclusão")}</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            disabled={isDeleting}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <label>
            {t("modalDeleteProject.typeYesToDelete", "Digite")}{" "}
            <b>{t("modalDeleteProject.sim", "SIM")}</b>{" "}
            {t("modalDeleteProject.toDelete", "para apagar o projeto")}
          </label>
          <div className="input-confirm-container">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(""); // Limpa erro quando usuário digitar
              }}
              placeholder={t(
                "modalDeleteProject.inputPlaceholder",
                "Digite aqui"
              )}
              disabled={isDeleting}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleDelete();
                }
              }}
            />
            {error && <p className="input-error">{error}</p>}
            <button 
              className="save-btn" 
              onClick={handleDelete}
              disabled={isDeleting || input.trim() === ""}
            >
              {isDeleting ? (
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                >
                  <span className="visually-hidden">Excluindo...</span>
                </div>
              ) : (
                t("buttons.confirm", "Confirmar")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteProject;
