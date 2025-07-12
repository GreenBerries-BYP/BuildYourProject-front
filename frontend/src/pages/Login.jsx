import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { FloatLabel } from "primereact/floatlabel";
import { useTranslation } from "react-i18next";

import api from "../api/api";
import { saveToken } from "../auth/auth";
import "../styles/LoginCadastro.css";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
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
      saveToken(res.data.access);
      setTimeout(() => navigate("/home"), 300);
    } catch (err) {
      console.error("Erro ao logar:", err);
    } finally {
      setLoading(false);
    }
  };

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
              className="row p-4 d-flex justify-content-between flex-column gap-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="row justify-content-center gap-3">
                <div className="mb-4">
                  <FloatLabel>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: t("login.emailRequired", "Email é obrigatório"),
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: t("login.emailInvalid", "Email inválido"),
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
                    <label htmlFor="email">{t("login.emailLabel", "Email")}</label>
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
                        required: t("login.passwordRequired", "Senha é obrigatória"),
                      }}
                      render={({ field }) => (
                        <Password
                          inputId="senha"
                          {...field}
                          toggleMask
                          className={`byp-input-field ${errors.senha ? "p-invalid" : ""}`}
                          inputClassName={`byp-input-field ${errors.senha ? "p-invalid" : ""}`}
                          footer={footer}
                        />
                      )}
                    />
                    <label htmlFor="senha">{t("login.passwordLabel", "Senha")}</label>
                  </FloatLabel>
                  {errors.senha && (
                    <small className="p-error">{errors.senha.message}</small>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <Link className="link-esqueci" to="/forgot_password">
                  {t("login.forgotPasswordLink", "Esqueci ou quero trocar minha senha")}
                </Link>
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
                  type="button"
                  className="col-12 col-lg-5 mx-3 py-2 btn-change-page flex-fill text-center"
                  onClick={() => navigate("/register")}
                >
                  {t("login.register")}
                </button>

                <button
                  className="col-12 col-lg-5 mx-3 py-2 btn-acesso-verde flex-fill d-flex justify-content-center align-items-center"
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
                        {t("login.loading", "Carregando...")}
                      </span>
                    </div>
                  ) : (
                    t("login.signIn")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
