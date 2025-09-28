// src/pages/DadosUsuario.jsx

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { FileUpload } from "primereact/fileupload";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

import { useAuthContext } from "../auth/authContext";
import { fetchUserData } from "../api/userService";
import toastService from "../api/toastService";

import ModalForgotPassword from "../components/ModalForgotPassword";
import "../styles/DadosUsuario.css";

const getInitials = (name = "") => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

function DadosUsuario() {
  const { t } = useTranslation();
  const { user: contextUser } = useAuthContext();

  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    fetchUserData()
      .then((data) => {
        setUserData(data);
        reset(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados do usuário:", err);
        toastService.error("Erro", "Não foi possível carregar seus dados.");
      })
      .finally(() => setIsLoading(false));
  }, [reset]);

  const onUpdateSubmit = async (formData) => {
    // api de upload quando fizermos
    /*
    toastService.info("Aguarde", "Salvando suas alterações...");
    try {
      // const updatedUser = await updateUserData(formData);
      // setUserData(updatedUser);
      // reset(updatedUser);
      // setIsEditing(false);
      // toastService.success("Sucesso!", "Seus dados foram atualizados.");
    } catch (err) {
      // toastService.error("Erro", "Não foi possível salvar as alterações.");
    }
    */

    console.log("Dados para atualizar:", formData);
    toastService.success("Sucesso!", "Seus dados foram salvos (simulação).");
    setUserData(formData);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    // api de upload da foto de perfil do usuário se fizermos
    const file = event.files[0];
    console.log("Arquivo para upload:", file);
    toastService.info(
      "Funcionalidade em desenvolvimento",
      "A API para upload de avatar ainda não foi implementada."
    );
  };

  const handleDeleteAccount = () => {
    confirmDialog({
      message:
        "Você tem certeza que deseja excluir sua conta? Esta ação é irreversível.",
      header: "Confirmação de Exclusão",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Sim, excluir",
      rejectLabel: "Não, cancelar",
      accept: () => {
        // api de delete caso fizermos
        toastService.warn("Ação necessária", "Conta excluída (simulação).");
      },
    });
  };

  const handleCancelEdit = () => {
    reset(userData);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="spinner-container">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <ConfirmDialog />
      <h1>Bem vindo, {userData?.full_name?.split(" ")[0]}!</h1>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            <Avatar
              label={getInitials(userData?.full_name)}
              size="xlarge"
              shape="circle"
              image={userData?.avatar_url}
            />
            {isEditing && (
              <FileUpload
                mode="basic"
                name="avatar"
                accept="image/*"
                maxFileSize={1000000} // 1MB
                customUpload
                uploadHandler={handleAvatarUpload}
                auto
                chooseLabel=" "
                className="avatar-edit-button"
                icon="pi pi-pencil"
              />
            )}
          </div>
          <h2>{userData?.full_name}</h2>
          <p className="username-display">@{userData?.username}</p>
        </div>

        <form onSubmit={handleSubmit(onUpdateSubmit)} className="profile-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="fullName">{t("dadosUsuario.name")}</label>
              <Controller
                name="full_name"
                control={control}
                rules={{ required: "Nome completo é obrigatório." }}
                render={({ field }) => (
                  <InputText
                    id="fullName"
                    {...field}
                    disabled={!isEditing}
                    className={errors.full_name ? "p-invalid" : ""}
                  />
                )}
              />
              {errors.full_name && (
                <small className="p-error">{errors.full_name.message}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="username">{t("dadosUsuario.username")}</label>
              <Controller
                name="username"
                control={control}
                rules={{ required: "Nome de usuário é obrigatório." }}
                render={({ field }) => (
                  <InputText
                    id="username"
                    {...field}
                    disabled={!isEditing}
                    className={errors.username ? "p-invalid" : ""}
                  />
                )}
              />
              {errors.username && (
                <small className="p-error">{errors.username.message}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="email">{t("dadosUsuario.email")}</label>
              <InputText id="email" value={userData.email || ""} disabled />
              <small className="p-d-block">
                O email não pode ser alterado.
              </small>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <Button
                label={t("dadosUsuario.editButton")}
                icon="pi pi-user-edit"
                onClick={() => setIsEditing(true)}
              />
            ) : (
              <div className="edit-mode-buttons">
                <Button
                  label={t("buttons.save")}
                  icon="pi pi-check"
                  type="submit"
                  disabled={!isDirty}
                />
                <Button
                  label={t("buttons.cancel")}
                  icon="pi pi-times"
                  className="p-button-secondary"
                  type="button"
                  onClick={handleCancelEdit}
                />
              </div>
            )}
          </div>
        </form>

        <div className="password-section">
          <Button
            label="Alterar Senha"
            icon="pi pi-key"
            className="p-button-text"
            onClick={() => setShowForgotModal(true)}
          />
        </div>
      </div>

      <div className="danger-zone">
        <h3>{t("dadosUsuario.dangerZone", "Zona de Perigo")}</h3>
        <div className="danger-zone-content">
          <p>
            Excluir sua conta removerá permanentemente todos os seus dados. Esta
            ação não pode ser desfeita.
          </p>
          <Button
            label="Excluir Minha Conta"
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
