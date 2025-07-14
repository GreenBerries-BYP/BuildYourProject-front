import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { FloatLabel } from 'primereact/floatlabel';
import api from "../api/api";
import "../styles/LoginCadastro.css";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const footer = (
    <>
      <Divider />
      <p className="mt-2 fw-bold list">{t("login.suggestions")}</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3 list">
        <li>{t("login.lowercase")}</li>
        <li>{t("login.uppercase")}</li>
        <li>{t("login.especialCaracter")}</li>
        <li>{t("login.number")}</li>
      </ul>
    </>
  );

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await api.post("/register/", {
        full_name: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      console.log("Cadastro realizado:", response.data);
      navigate("/login");
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid register my-5 d-flex justify-content-center align-items-center">
      <div className="col-lg-6 card-register col-9 rounded py-5 px-3 d-flex flex-column justify-content-between bg-white">
        <img
          className="row logo-h align-self-center cursor-pointer"
          src="/imgs/logo_vert_BYP.svg"
          alt={t("altText.logoBYPVertical", "BYP Vertical Logo")}
          onClick={() => navigate("/")}
        />

        <form
          className="row p-5 m-5 h-100 d-flex flex-column justify-content-between"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-4">
            
            <FloatLabel>
              <Controller
                name="fullName"
                control={control}
                rules={{
                  required: t("register.fullNameRequired", "Nome completo é obrigatório"),
                }}
                render={({ field }) => (
                  <InputText
                    id="fullName"
                    {...field}
                    className={`byp-input-field ${errors.fullName ? "p-invalid" : ""}`}
                  />
                )}
              />
              <label htmlFor="fullName">
                {t("register.fullNameLabel", "Nome completo")}
              </label>
            </FloatLabel>
            {errors.fullName && (
              <small className="p-error">{errors.fullName.message}</small>
            )}
          </div>

          <div className="mb-4">
            <FloatLabel>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: t("register.usernameRequired", "Usuário é obrigatório"),
                }}
                render={({ field }) => (
                  <InputText
                    id="username"
                    {...field}
                    className={`byp-input-field ${errors.username ? "p-invalid" : ""}`}
                  />
                )}
              />
              <label htmlFor="username">
                {t("register.usernameLabel", "Usuário")}
              </label>
            </FloatLabel>
            {errors.username && (
              <small className="p-error">{errors.username.message}</small>
            )}
          </div>

          <div className="mb-4">
            <FloatLabel>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: t("register.emailRequired", "Email é obrigatório"),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t("register.emailInvalid", "Email inválido"),
                  },
                }}
                render={({ field }) => (
                  <InputText
                    id="email"
                    {...field}
                    className={`byp-input-field ${errors.email ? "p-invalid" : ""}`}
                  />
                )}
              />
              <label htmlFor="email">
                {t("register.emailLabel", "Email")}
              </label>
            </FloatLabel>
            {errors.email && (
              <small className="p-error">{errors.email.message}</small>
            )}
          </div>

          <div className="mb-4">
            <FloatLabel>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: t("register.passwordRequired", "Senha é obrigatória"),
                  minLength: {
                    value: 8,
                    message: t("register.passwordMinLength", "A senha deve ter pelo menos 8 caracteres"),
                  },
                }}
                render={({ field }) => (
                  <Password
                    inputId="password"
                    {...field}
                    toggleMask
                    footer={footer}
                    className={`byp-input-field ${errors.password ? "p-invalid" : ""}`}
                    inputClassName={`byp-input-field ${errors.password ? "p-invalid" : ""}`}
                  />
                )}
              />
              <label htmlFor="password">
                {t("register.passwordLabel", "Senha")}
              </label>
            </FloatLabel>
            {errors.password && (
              <small className="p-error">{errors.password.message}</small>
            )}
          </div>

          <div className="mb-4">
            <FloatLabel>
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: t("register.confirmPasswordRequired", "Confirmação de senha é obrigatória"),
                  validate: (value) =>
                    value === watch("password") || t("register.errorPasswordMismatch", "As senhas não coincidem"),
                }}
                render={({ field }) => (
                  <Password
                    inputId="confirmPassword"
                    {...field}
                    toggleMask
                    footer={footer}
                    className={`byp-input-field ${errors.confirmPassword ? "p-invalid" : ""}`}
                    inputClassName={`byp-input-field ${errors.confirmPassword ? "p-invalid" : ""}`}
                  />
                )}
              />
              <label htmlFor="confirmPassword">
                {t("register.confirmPasswordLabel", "Confirmar Senha")}
              </label>
            </FloatLabel>
            {errors.confirmPassword && (
              <small className="p-error">{errors.confirmPassword.message}</small>
            )}
          </div>

          <div className="mb-4 d-flex align-items-center">
            <Controller
              name="acceptTerms"
              control={control}
              rules={{
                required: t(
                  "register.termsRequired",
                  "Você precisa aceitar os termos de uso e políticas de privacidade"
                ),
              }}
              render={({ field }) => (
                <Checkbox
                  inputId="acceptTerms"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.checked)}
                  className={`me-2 ${errors.acceptTerms ? "p-invalid" : ""}`}
                />
              )}
            />
            <label htmlFor="acceptTerms" className="check-label">
              {t(
                "register.terms.intro",
                "Ao criar uma conta nessa aplicação eu declaro que aceito os"
              )}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                {" "}
                {t("register.terms.termsLinkText", "termos de uso")}{" "}
              </a>
              {t("register.terms.and", "e as")}
              <a href="/politics" target="_blank" rel="noopener noreferrer">
                {" "}
                {t("register.terms.policyLinkText", "políticas de privacidade")}
              </a>
              .
            </label>
          </div>
          {errors.acceptTerms && (
            <small className="p-error">{errors.acceptTerms.message}</small>
          )}

          <div className="row d-flex justify-content-center text-center gap-4">
            <button
              className="col-12 col-lg-5 py-2 py-lg-4 w-100 btn-cadastro justify-content-center"
              type="submit"
              disabled={loading || !isValid}
            >
              {loading ? (
                <div
                  className="spinner-border text-light"
                  style={{ width: "2rem", height: "2rem" }}
                  role="status"
                >
                  <span className="visually-hidden">
                    {t("login.loading")}
                  </span>
                </div>
              ) : (
                t("register.submitButton")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;