// src/components/Register.jsx

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { FloatLabel } from "primereact/floatlabel";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../hooks/useAuth";
import toastService from "../api/toastService";

import "../styles/LoginCadastro.css";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { googleLogin, register, isLoading, isGoogleLoading } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleLogin(tokenResponse);
    },
    onError: () => {
      toastService.error(
        "Erro no Google",
        "Não foi possível se cadastrar com o Google."
      );
    },
  });

  const passwordFooter = (
    <>
      <Divider />
      <p className="mt-2 fw-bold">{t("login.suggestions", "Sugestões:")}</p>
      <ul className="pl-2 ml-2 mt-0">
        <li>{t("login.lowercase", "Ao menos uma letra minúscula")}</li>
        <li>{t("login.uppercase", "Ao menos uma letra maiúscula")}</li>
        <li>{t("login.number", "Ao menos um número")}</li>
        <li>{t("login.specialCharacter", "Ao menos um caractere especial")}</li>
      </ul>
    </>
  );

  const onSubmit = (data) => {
    register(data);
  };

  return (
    <div className="container-fluid register my-5 d-flex justify-content-center align-items-center">
      <div className="col-lg-6 card-register col-9 rounded py-5 px-3 d-flex flex-column justify-content-center bg-white">
        <img
          className="col-6 logo-h align-self-center mb-4"
          src="/imgs/logo_vert_BYP.svg"
          alt={t("altText.logoBYPVertical", "Logo Vertical BYP")}
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />

        <form
          className="row p-lg-5 p-md-4 p-2 m-0 h-100 d-flex flex-column justify-content-between gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="p-float-label">
            <FloatLabel>
              <Controller
                name="fullName"
                control={control}
                rules={{
                  required: t(
                    "register.fullNameRequired",
                    "Nome completo é obrigatório"
                  ),
                }}
                render={({ field }) => (
                  <InputText
                    id="fullName"
                    {...field}
                    className={`byp-input-field ${
                      errors.fullName ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              <label htmlFor="fullName">
                {t("register.fullNameLabel", "Nome Completo")}
                <span className="required-asterisk">*</span>
              </label>
            </FloatLabel>
            {errors.fullName && (
              <small className="p-error">{errors.fullName.message}</small>
            )}
          </div>

          <div className="p-float-label">
            <FloatLabel>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: t(
                    "register.usernameRequired",
                    "Usuário é obrigatório"
                  ),
                }}
                render={({ field }) => (
                  <InputText
                    id="username"
                    {...field}
                    className={`byp-input-field ${
                      errors.username ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              <label htmlFor="username">
                {t("register.usernameLabel", "Usuário")}
                <span className="required-asterisk">*</span>
              </label>
            </FloatLabel>
            {errors.username && (
              <small className="p-error">{errors.username.message}</small>
            )}
          </div>

          <div className="p-float-label">
            <FloatLabel>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: t("register.emailRequired", "Email é obrigatório"),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t(
                      "register.invalidEmail",
                      "Formato de email inválido"
                    ),
                  },
                }}
                render={({ field }) => (
                  <InputText
                    id="email"
                    {...field}
                    className={`byp-input-field ${
                      errors.email ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              <label htmlFor="email">
                {t("register.emailLabel", "Email")}
                <span className="required-asterisk">*</span>
              </label>
            </FloatLabel>
            {errors.email && (
              <small className="p-error">{errors.email.message}</small>
            )}
          </div>

          <div className="p-float-label">
            <FloatLabel>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: t(
                    "register.passwordRequired",
                    "Senha é obrigatória"
                  ),
                  minLength: {
                    value: 8,
                    message: "A senha deve ter no mínimo 8 caracteres",
                  },
                }}
                render={({ field }) => (
                  <Password
                    inputId="password"
                    {...field}
                    toggleMask
                    footer={passwordFooter}
                    inputClassName={`byp-password-field ${
                      errors.password ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              <label htmlFor="password">
                {t("register.passwordLabel", "Senha")}
                <span className="required-asterisk">*</span>
              </label>
            </FloatLabel>
            {errors.password && (
              <small className="p-error">{errors.password.message}</small>
            )}
          </div>

          <div className="p-float-label">
            <FloatLabel>
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: t(
                    "register.confirmPasswordRequired",
                    "Confirmação de senha é obrigatória"
                  ),
                  validate: (value) =>
                    value === watch("password") ||
                    t(
                      "register.errorPasswordMismatch",
                      "As senhas não coincidem"
                    ),
                }}
                render={({ field }) => (
                  <Password
                    inputId="confirmPassword"
                    {...field}
                    toggleMask
                    feedback={false}
                    inputClassName={`byp-password-field ${
                      errors.confirmPassword ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              <label htmlFor="confirmPassword">
                {t("register.confirmPasswordLabel", "Confirme a Senha")}
                <span className="required-asterisk">*</span>
              </label>
            </FloatLabel>
            {errors.confirmPassword && (
              <small className="p-error">
                {errors.confirmPassword.message}
              </small>
            )}
          </div>

          <div className="d-flex align-items-center">
            <Controller
              name="acceptTerms"
              control={control}
              rules={{
                validate: (value) =>
                  value === true ||
                  t("register.termsRequired", "Você precisa aceitar os termos"),
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
              {t("register.iAccept")}{" "}
              <a href="/use_terms" target="_blank" rel="noopener noreferrer">
                {t("register.termsOfUse")}
              </a>{" "}
              {t("register.and")}{" "}
              <a
                href="/privacy_policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("register.privacyPolicy")}
              </a>
              .
            </label>
          </div>
          {errors.acceptTerms && (
            <small className="p-error">{errors.acceptTerms.message}</small>
          )}

          <div className="row d-flex justify-content-center w-100 align-items-center gap-3 mt-4">
            <button
              className="col-12 col-lg-5 mx-3 py-2 btn-cadastro flex-fill d-flex justify-content-center align-items-center"
              type="submit"
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <div
                  className="spinner-border text-light"
                  style={{ width: "2rem", height: "2rem" }}
                  role="status"
                ></div>
              ) : (
                t("register.submitButton", "Cadastrar")
              )}
            </button>
          </div>
          <Divider align="center" className="mt-2" type="dashed">
            <b>{t("login.or", "ou")}</b>
          </Divider>

          <div className="d-flex justify-content-center w-100 position-relative">
            <GoogleLogin
                  onSuccess={googleLogin}
                  onError={() => {
                    toastService.error("Erro no Google", "Não foi possível autenticar.");
                  }}
                  useOneTap={false}
                  render={({ onClick }) => (
                    <button
                      type="button"
                      className="btn-google-custom"
                      disabled={isGoogleLoading}
                      onClick={onClick}
                    >
                      {isGoogleLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                      ) : (
                        <>
                          <FcGoogle className="google-icon" />
                          <span>{t("login.google")}</span>
                        </>
                      )}
                    </button>
                  )}
                />
            
          </div>
        </form>

        <div className="tem-conta w-100 text-center mt-5">
          <span>{t("register.alredyHaveAccount")}</span>
          <button
            type="button"
            className="btn-change-page purple-color text-center"
            onClick={() => navigate("/login")}
          >
            {t("register.signIn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
