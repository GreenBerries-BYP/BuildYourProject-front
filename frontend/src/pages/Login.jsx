// src/components/Login.jsx

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { FloatLabel } from "primereact/floatlabel";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

import { useAuth } from "../hooks/useAuth";
import toastService from "../api/toastService";

import ModalForgotPassword from "../components/ModalForgotPassword";
import "../styles/LoginCadastro.css";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showForgotModal, setShowForgotModal] = React.useState(false);

  const { login, googleLogin, isLoading, isGoogleLoading } = useAuth();

   const handleGoogleLogin = useGoogleLogin({
    onSuccess: googleLogin,
    onError: () => {
      console.log('Google Login Failed');
    }
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      email: "",
      senha: "",
      manterLogado: false,
    },
  });

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <div className="container-fluid login d-flex justify-content-center align-items-center mt-4">
      <div className="col-10 card-login rounded d-flex justify-content-center align-items-center bg-white shadow-lg">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-6 d-none d-lg-flex justify-content-center align-items-center">
            <img
              src="/imgs/problem-solving.svg"
              alt={t(
                "altText.puzzlePeople",
                "Duas pessoas montando um quebra-cabeça"
              )}
              className="img-fluid"
            />
          </div>

          <div className="col-12 col-lg-5 d-flex flex-column">
            <img
              className="col-6 logo-h align-self-center mb-4"
              src="/imgs/logo_vert_BYP.svg"
              alt={t("altText.logoBYPVertical", "Logo Vertical BYP")}
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            />

            <form
              className="row p-4 d-flex justify-content-between flex-column gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="row justify-content-center gap-3">
                <div className="mb-4">
                  <FloatLabel>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: t(
                          "login.emailRequired",
                          "Email é obrigatório"
                        ),
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: t(
                            "login.emailInvalid",
                            "Formato de email inválido"
                          ),
                        },
                      }}
                      render={({ field }) => (
                        <InputText
                          id="email"
                          {...field}
                          className={`p-inputtext-sm byp-input-field ${
                            errors.email ? "p-invalid" : ""
                          }`}
                        />
                      )}
                    />
                    <label htmlFor="email">
                      {t("login.emailLabel", "Email")}
                      <span className="required-asterisk">*</span>
                    </label>
                  </FloatLabel>
                  {errors.email && (
                    <small className="p-error">{errors.email.message}</small>
                  )}
                </div>

                <div className="mb-4">
                  <FloatLabel>
                    <Controller
                      name="senha"
                      control={control}
                      rules={{
                        required: t(
                          "login.passwordRequired",
                          "Senha é obrigatória"
                        ),
                      }}
                      render={({ field }) => (
                        <Password
                          inputId="senha"
                          {...field}
                          toggleMask
                          feedback={false}
                          inputClassName={`byp-input-field ${
                            errors.senha ? "p-invalid" : ""
                          }`}
                        />
                      )}
                    />
                    <label htmlFor="senha">
                      {t("login.passwordLabel", "Senha")}
                      <span className="required-asterisk">*</span>
                    </label>
                  </FloatLabel>
                  {errors.senha && (
                    <small className="p-error">{errors.senha.message}</small>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="link-esqueci btn btn-link p-0"
                  onClick={() => setShowForgotModal(true)}
                >
                  {t("login.forgotPasswordLink", "Esqueci minha senha")}
                </button>
              </div>

              <div className="d-flex align-items-center">
                <Controller
                  name="manterLogado"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      inputId="manter_logado"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.checked)}
                      className="me-2"
                    />
                  )}
                />
                <label htmlFor="manter_logado" className="check-label">
                  {t("login.keepLoggedIn", "Manter-me conectado")}
                </label>
              </div>

              <div className="row p-0 pt-5 d-flex justify-content-center w-100 align-items-center gap-5">
                <button
                  className="col-12 col-lg-5 mx-3 py-2 btn-acesso-verde flex-fill d-flex justify-content-center align-items-center"
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
                    t("login.signIn", "Entrar")
                  )}
                </button>
              </div>
              <Divider align="center" className="mt-1" type="dashed">
                <b>{t("login.or", "ou")}</b>
              </Divider>

              <div className="d-flex justify-content-center w-100 position-relative">
                 <button
                  type="button"
                  className="btn-google-custom"
                  disabled={isGoogleLoading}
                  onClick={() => handleGoogleLogin()}
                >
                  {isGoogleLoading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></div>
                  ) : (
                    <>
                      <FcGoogle className="google-icon" />
                      <span>{t("login.google")}</span>
                    </>
                  )}
                </button>
                {/* <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    cursor: "pointer",
                  }}
                >
                  <GoogleLogin
                    onSuccess={googleLogin}
                    onError={() =>
                      toastService.error(
                        "Erro no Google",
                        "Não foi possível autenticar."
                      )
                    }
                    useOneTap={false}
                  />
                </div> */}
              </div>
            </form>

            <div className="tem-conta mt-5">
              <span>{t("login.doesntHaveAccount")}</span>
              <button
                type="button"
                className="btn-change-page green-color"
                onClick={() => navigate("/register")}
              >
                {t("login.register", "Cadastre-se")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalForgotPassword
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default Login;
