import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { FloatLabel } from "primereact/floatlabel";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import ModalForgotPassword from "../components/ModalForgotPassword";
import toastService from "../api/toastService";
import { jwtDecode } from "jwt-decode";



import api from "../api/api";
import { saveToken } from "../auth/auth";
import "../styles/LoginCadastro.css";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const googleToken = localStorage.getItem("google_access_token");

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

  const onSubmit = async (data) => {
    
    setLoading(true);
    try {
      const res = await api.post("/login/", {
        email: data.email,
        password: data.senha,
      });
      saveToken(res.data.access, data.manterLogado, res.data.refresh);

      toastService.success(
        t("toast.loginSuccessTitle", "Bem-vindo!"),
        t("toast.loginSuccessDetail", "Login realizado com sucesso.")
      );

      setTimeout(() => navigate("/home"), 300);
    } catch (err) {
      if (err.response?.status === 401) {
        toastService.error(
          t("toast.loginFailedTitle", "Falha no login"),
          t("toast.loginFailedDetail", "E-mail ou senha incorretos.")
        );
      } else {
        toastService.error(
          t("toast.serverErrorTitle", "Erro no servidor"),
          t("toast.serverErrorDetail", "Tente novamente mais tarde.")
        );
      }
      console.error("Erro ao logar:", err);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (response) => {
    setLoadingGoogle(true);
    const accessToken = response.credential;

    try {
      const res = await api.post("/auth/google/", {
        access_token: accessToken,
      });
      saveToken(res.data.access, true,  res.data.refresh);
      
      localStorage.setItem("google_access_token", accessToken);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("user_info", JSON.stringify(res.data.user));


      toastService.success(
        t("toast.loginSuccessTitle", "Bem-vindo!"),
        t("toast.loginSuccessDetail", "Login realizado com sucesso.")
      );

      const userInfo = jwtDecode(res.data.access);
      console.log("Backend user info:", userInfo); 

      const googleUserInfo = jwtDecode(accessToken);
      console.log("google user info:", googleUserInfo); 

      navigate("/home");
    } catch (err) {
      toastService.error(
        t("toast.googleLoginErrorTitle", "Erro no Google Login"),
        t("toast.googleLoginErrorDetail", "Não foi possível autenticar.")
      );
      console.error("Erro ao autenticar com Google:", err);
    } finally {
      setLoadingGoogle(false); 
    }
  };

  return (
    <div className="container-fluid login d-flex justify-content-center align-items-center p-0">
      <div className="col-10 card-login rounded d-flex justify-content-center align-items-center bg-white shadow-lg">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-6 d-none d-lg-flex justify-content-center align-items-center">
            <img
              src="/imgs/problem-solving.svg"
              alt={t("altText.puzzlePeople", "Two people doing a puzzle")}
              className="img-fluid"
            />
          </div>

          <div className="col-12 col-lg-5 d-flex flex-column">
            <img
              className="col-6 logo-h align-self-center mb-4"
              src="/imgs/logo_vert_BYP.svg"
              alt={t("altText.logoBYPVertical", "BYP Vertical Logo")}
              onClick={() => navigate("/")}
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
                          message: t("login.emailInvalid"),
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
                          className={`byp-input-field ${
                            errors.senha ? "p-invalid" : ""
                          }`}
                          inputClassName={`byp-input-field ${
                            errors.senha ? "p-invalid" : ""
                          }`}
                        />
                      )}
                    />
                    <label htmlFor="senha">
                      {t("login.passwordLabel")}
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
                  {t(
                    "login.forgotPasswordLink",
                    "Esqueci ou quero trocar minha senha"
                  )}
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
                  disabled={loading || !isValid}
                >
                  {loading ? (
                    <>
                      <div
                        className="spinner-border text-light"
                        style={{
                          width: "2rem",
                          height: "2rem",
                          padding: "10px",
                        }}
                        role="status"
                      ></div>
                    </>
                  ) : (
                    t("login.signIn")
                  )}
                </button>
                <span className="tem-conta w-100 flex-fill col-12 col-lg-5 mx-3 py-2">
                  <p>Não tem conta ainda?</p>
                  <button
                    type="button"
                    className="px-5 btn-change-page text-center "
                    onClick={() => navigate("/register")}
                  >
                    {t("login.register")}
                  </button>
                </span>
              </div>
            </form>

            <Divider align="center" type="dashed">
              <b>{t("login.or")}</b>
            </Divider>

            <div className="d-flex justify-content-center w-100">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => {
                  toastService.error(
                    t("toast.googleLoginErrorTitle", "Erro no Google Login"),
                    t("toast.googleLoginErrorDetail", "Não foi possível autenticar.")
                  );
                }}
                useOneTap={false}
                scope="openid email profile https://www.googleapis.com/auth/calendar"
              />
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
