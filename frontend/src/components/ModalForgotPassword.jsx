import { useEffect, useRef, useState } from "react";
import "../styles/ModalForgotPasswordDeleteProject.css";
import { useTranslation } from "react-i18next";
import api from "../api/api";

const ModalForgotPassword = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState("email");
  const [code, setCode] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email.trim()) {
      setError(t("messages.emailCantBeEmpty", "O e-mail é obrigatório."));
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("messages.invalidEmailFormat", "Formato de e-mail inválido."));
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/send-reset-code/", { email });
      setSuccess(
        t(
          "messages.verificationCodeSent",
          "Um código de verificação foi enviado para seu e-mail."
        )
      );
      setStep("code");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        t("messages.errorSendingCode", "Erro ao enviar o código. Tente novamente.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length < 6) {
      setError("Digite os 6 dígitos do código");
      return;
    }

    setLoading(true);
    setError("");
   
    try {
      const response = await api.post("/auth/verify-reset-code/", {
        email: email,
        code: verificationCode
      });
     
      setSuccess("Código verificado com sucesso!");
      setStep("newPassword");
    } catch (err) {
      console.error("Erro na verificação:", err.response?.data);
      setError(
        err.response?.data?.error ||
        "Código inválido ou expirado. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError("");
   
    try {
      await api.post("/auth/reset-password/", {
        email: email,
        code: code.join(""),
        new_password: newPassword
      });
     
      setSuccess("Senha redefinida com sucesso!");
      setTimeout(() => {
        onClose();
        // Limpa todos os estados
        setEmail("");
        setCode(new Array(6).fill(""));
        setNewPassword("");
        setConfirmPassword("");
        setStep("email");
        setError("");
        setSuccess("");
      }, 2000);
     
    } catch (err) {
      console.error("Erro ao redefinir senha:", err.response?.data);
      setError(
        err.response?.data?.error ||
        "Erro ao redefinir senha. Tente novamente."
      );
    } finally {
      setLoading(false);
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

  // Focar no primeiro input quando mudar para step de código
  useEffect(() => {
    if (step === "code" && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [step]);

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
          {step === "email" && (
            <form onSubmit={handleSubmitEmail}>
              <label htmlFor="forgotEmail">{t("inputs.email", "Digite seu e-mail")}</label>
              <input
                id="forgotEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("placeholders.email", "Seu e-mail")}
                disabled={loading}
              />
              {error && <p className="input-error">{error}</p>}
              {success && <p className="input-success">{success}</p>}
              <div className="navigation-buttons">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? t("buttons.sending", "Enviando...") : t("buttons.sendCode", "Enviar código")}
                </button>
              </div>
            </form>
          )}
         
          {step === "code" && (
            <div className="code-inputs">
              <p>{t("messages.enterVerificationCode", "Digite o código de 6 dígitos enviado para")} <strong>{email}</strong></p>
              <div className="inputs-container">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    disabled={loading}
                  />
                ))}
              </div>
              {error && <p className="input-error">{error}</p>}
              {success && <p className="input-success">{success}</p>}
              <div className="navigation-buttons">
                <button onClick={handleVerifyCode} className="save-btn" disabled={loading}>
                  {loading ? t("buttons.verifying", "Verificando...") : t("buttons.verifyCode", "Verificar Código")}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setStep("email")}
                  disabled={loading}
                >
                  {t("buttons.back", "Voltar")}
                </button>
              </div>
            </div>
          )}
         
          {step === "newPassword" && (
            <div className="new-password-step">
              <p>Digite sua nova senha</p>
             
              <div className="form-group">
                <label>Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  disabled={loading}
                />
              </div>
             
              <div className="form-group">
                <label>Confirmar Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente a senha"
                  disabled={loading}
                />
              </div>
             
              {error && <p className="input-error">{error}</p>}
              {success && <p className="input-success">{success}</p>}
             
              <div className="navigation-buttons">
                <button onClick={handleResetPassword} className="save-btn" disabled={loading}>
                  {loading ? "Redefinindo..." : "Redefinir Senha"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setStep("code")}
                  disabled={loading}
                >
                  {t("buttons.back", "Voltar")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalForgotPassword;