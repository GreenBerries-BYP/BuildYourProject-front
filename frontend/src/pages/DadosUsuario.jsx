import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { fetchUserData } from "../api/userService";
import { useTranslation } from "react-i18next";
import { Avatar } from "primereact/avatar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

import ModalForgotPassword from "../components/ModalForgotPassword";
import "../styles/Home.css";
import "../styles/DadosUsuario.css"

const getInitials = (name = "") => {
  if (!name) return "";
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
};

function DadosUsuario() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
      .catch((err) => console.error("Erro ao buscar dados do usuário:", err))
      .finally(() => setIsLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      console.log("Salvando dados:", data);
      setUserData({ ...userData, ...data });
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
    }
  };

  const handleDeleteAccount = () => {
    confirmDialog({
      message: "Você tem certeza que deseja excluir sua conta? Esta ação é irreversível.",
      header: "Confirmação de Exclusão",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sim, excluir",
      rejectLabel: "Não, cancelar",
      accept: () => {
        console.log("Usuário confirmou a exclusão da conta.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="spinner-container">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column">
      <h2>{t("dadosUsuario.welcome")}{userData.full_name}</h2>
      <ConfirmDialog />

      <div className="user-card card-background">
        <div className="profile-header d-flex flex-row align-items-center gap-2">
          <div className="avatar-container">
            <Avatar
              label={getInitials(userData.full_name)}
              size="xlarge"
              shape="circle"
              image={userData.avatar_url}
            />
          </div>
          <p className="username-display">@{userData.username}</p>
        </div>

        {!isEditing ? (
          <div className="user-info-container">
            <div className="user-info">
              <p><strong>{t("dadosUsuario.name", "Nome completo")}:</strong> {userData.full_name}</p>
              <p><strong>{t("dadosUsuario.username", "Usuário")}:</strong> {userData.username}</p>
              <p><strong>{t("dadosUsuario.email", "Email")}:</strong> {userData.email}</p>
            </div>
            <div className="password-section">
              <Button
                label = {t("dadosUsuario.changePassword")}
                icon="pi pi-key"
                className="p-button-text"
                onClick={() => setShowForgotModal(true)}
              />
            </div>
            <Button
              label={t("dadosUsuario.editButton", "Editar dados")}
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
              <label>{t("dadosUsuario.name", "Nome completo")}</label>
            </div>

            <div className="p-float-label">
              <Controller
                name="username"
                control={control}
                render={({ field }) => <InputText {...field} />}
              />
              <label>{t("dadosUsuario.username", "Usuário")}</label>
            </div>

            <div className="p-float-label">
              <Controller
                name="email"
                control={control}
                render={({ field }) => <InputText {...field} />}
              />
              <label>{t("dadosUsuario.email", "Email")}</label>
            </div>

            <div className="edit-buttons">
              <Button type="submit" label={t("buttons.save", "Salvar")} className="btn-save" />
              <Button
                type="button"
                label={t("buttons.cancel", "Cancelar")}
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  reset(userData);
                }}
              />
            </div>
          </form>
        )}

      </div>

      <div className="danger-zone">
        <h2>{t("dadosUsuario.dangerZone")}</h2>
        <div className="danger-zone-content">
          <p className="mt-2">{t("dadosUsuario.deleteText")}</p>
          <Button
            label= {t("dadosUsuario.deleteAccount")}
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={handleDeleteAccount}
          />
        </div>
      </div>

      <ModalForgotPassword
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}

export default DadosUsuario;