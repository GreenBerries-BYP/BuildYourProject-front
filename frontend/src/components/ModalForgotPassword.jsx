import { useEffect, useRef, useState } from "react";
import "../styles/ModalForgotPassword.css"; // você pode reaproveitar o css do outro modal
import { useTranslation } from "react-i18next";

const ModalForgotPassword = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(t("messages.emailCantBeEmpty", "O e-mail é obrigatório."));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("messages.invalidEmailFormat", "Formato de e-mail inválido."));
      return;
    }

    try {
      // Aqui você faria a chamada de API para enviar o código
      // await api.post("/auth/send-reset-code", { email });

      setSuccess(
        t(
          "messages.verificationCodeSent",
          "Um código de verificação foi enviado para seu e-mail."
        )
      );
    } catch (err) {
      setError(
        t("messages.errorSendingCode", "Erro ao enviar o código. Tente novamente.")
      );
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{t("titles.forgotPassword", "Recuperar Senha")}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <label htmlFor="forgotEmail">{t("inputs.email", "Digite seu e-mail")}</label>
            <input
              id="forgotEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholders.email", "Seu e-mail")}
            />
            {error && <p className="input-error">{error}</p>}
            {success && <p className="input-success">{success}</p>}
            <div className="navigation-buttons">
              <button type="submit" className="save-btn">
                {t("buttons.sendCode", "Enviar código")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalForgotPassword;
