import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { fetchUserData } from "../api/userService";
import "../styles/Home.css";
import { useTranslation } from "react-i18next";
import ModalForgotPassword from "../components/ModalForgotPassword";

function DadosUsuario() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { t } = useTranslation();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    fetchUserData()
      .then((data) => {
        setUserData(data);
        reset({
          full_name: data.full_name,
          username: data.username,
          email: data.email,
        });
      })
      .catch((err) => console.error("Erro ao buscar dados do usuário:", err));
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      // Chamar API de atualização aqui
      // const updated = await updateUserData(data);
      // setUserData(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
    }
  };

  if (!userData) return <p>{t("dadosUsuario.loading")}</p>;

  return (
    <div className="main-page-content dados-usuario-page">
      <div className="user-card card-background">
        <h1>{t("dadosUsuario.title")}</h1>

        {!isEditing ? (
          <div className="user-info-container">
            <div className="user-info">
              <p>
                <strong>{t("dadosUsuario.name")}:</strong> {userData.full_name}
              </p>
              <p>
                <strong>{t("dadosUsuario.username")}:</strong> {userData.username}
              </p>
              <p>
                <strong>{t("dadosUsuario.email")}:</strong> {userData.email}
              </p>
            </div>
            <Button
              label={t("dadosUsuario.editButton")}
              className="btn-edit"
              onClick={() => setIsEditing(true)}
            />
          </div>
        ) : (
          <form className="user-edit-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="p-float-label">
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => <InputText {...field} />}
              />
              <label>{t("dadosUsuario.name")}</label>
            </div>

            <div className="p-float-label">
              <Controller
                name="username"
                control={control}
                render={({ field }) => <InputText {...field} />}
              />
              <label>{t("dadosUsuario.username")}</label>
            </div>

            <div className="p-float-label">
              <Controller
                name="email"
                control={control}
                render={({ field }) => <InputText {...field} />}
              />
              <label>{t("dadosUsuario.email")}</label>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="link-esqueci btn btn-link p-0"
                onClick={() => setShowForgotModal(true)}
              >
                {t("login.forgotPasswordLink")}
              </button>
            </div>

            <div className="edit-buttons">
              <Button type="submit" label={t("buttons.save")} className="btn-save" />
              <Button
                type="button"
                label={t("buttons.cancel")}
                className="btn-cancel"
                onClick={() => setIsEditing(false)}
              />
            </div>
          </form>
        )}
      </div>

      <ModalForgotPassword
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}

export default DadosUsuario;
