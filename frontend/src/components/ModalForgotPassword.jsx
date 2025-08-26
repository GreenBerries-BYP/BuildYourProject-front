import { useEffect, useRef, useState } from "react";
import "../styles/ModalForgotPassword.css"; // você pode reaproveitar o css do outro modal
import { useTranslation } from "react-i18next";

const ModalForgotPassword = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const modalRef = useRef();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState("email"); // 'email' ou 'code'
  const [code, setCode] = useState(new Array(6).fill("")); // array com 6 posições
  const inputsRef = useRef([]);


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
        // await api.post("/auth/send-reset-code", { email });
        setSuccess(
            t(
            "messages.verificationCodeSent",
            "Um código de verificação foi enviado para seu e-mail."
            )
        );
        
        setStep("code"); // muda para a tela de código
    } catch (err) {
        setError(
            t("messages.errorSendingCode", "Erro ao enviar o código. Tente novamente.")
        );
    }

  };

    const handleCodeChange = (e, index) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) return; // aceita apenas números

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // foca no próximo input se digitou algo
        if (value && index < 5) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleConfirmCode = () => {
        const verificationCode = code.join("");
        if (verificationCode.length < 6) {
            setError(t("messages.enterFullCode", "Digite os 6 dígitos do código"));
            return;
        }

        // Aqui você chamaria a API para verificar o código
        console.log("Código enviado:", verificationCode);
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
        
        {step === "code" && (
            <div className="code-inputs">
            <p>{t("messages.enterVerificationCode", "Digite o código de 6 dígitos")}</p>
            <div className="inputs-container">
                {code.map((digit, idx) => (
                <input
                    key={idx}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(e, idx)}
                    ref={(el) => (inputsRef.current[idx] = el)}
                />
                ))}
            </div>
            {error && <p className="input-error">{error}</p>}
            <button onClick={handleConfirmCode} className="save-btn">
                {t("buttons.confirmCode", "Confirmar")}
            </button>
            </div>
        )}
      </div>

    </div>
  );
};

export default ModalForgotPassword;
