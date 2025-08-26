import "../styles/PrivacyTerms.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const I18N_STORAGE_KEY = "i18nextLng";

const TermosDeUso = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(
    localStorage.getItem(I18N_STORAGE_KEY)
  );

  const [darkMode, setDarkMode] = useState(false);

  const toggleLanguage = () => {
    const newLang = language === "pt-BR" ? "en-US" : "pt-BR";
    setLanguage(newLang);
    localStorage.setItem(I18N_STORAGE_KEY, newLang);
    i18n.changeLanguage(newLang);
  };

  const flagSrc =
    i18n.language === "pt-BR" ? "/imgs/brazil-.png" : "/imgs/united-states.png";
  const flagAlt =
    i18n.language === "pt-BR"
      ? t("altText.brazilFlag", "Brazilian Flag")
      : t("altText.usFlag", "US Flag");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  return (
    <div className="termos-page">
      <header className="termos-header">
        <div className="header-top">
          <h1>{t("terms.title", "Termos de Uso")}</h1>
          <p>{t("terms.lastUpdate", "Última atualização: 1 de dezembro de 2024")}</p>
        </div>
        <div className="header-bottom">
          <button
            onClick={toggleLanguage}
            className="header-icon"
            aria-label={t("header.changeLanguage")}
            >
            <img src={flagSrc} alt={flagAlt} className="bandeira" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`dark-mode-toggle ${darkMode ? "dark" : "light"}`}
            >
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
        </div>
      </header>

      <main className="termos-content">
        <section>
          <h2>{t("terms.acceptance.title", "1. Aceitação dos Termos")}</h2>
          <p>
            {t(
              "terms.acceptance.text",
              "Ao acessar ou usar o AmigosConnect, você concorda em cumprir estes Termos de Uso. Caso não concorde, solicitamos que não utilize a plataforma."
            )}
          </p>
        </section>

        <section>
          <h2>{t("terms.objective.title", "2. Objetivo do Serviço")}</h2>
          <p>
            {t(
              "terms.objective.text",
              "O AmigosConnect é uma plataforma social projetada para facilitar a conexão entre usuários, organizar eventos e promover interações saudáveis e significativas. Qualquer uso que viole esse propósito está estritamente proibido."
            )}
          </p>
        </section>

        <section>
          <h2>{t("terms.userResponsibilities.title", "3. Responsabilidades do Usuário")}</h2>
          <ul>
            <li>{t("terms.userResponsibilities.item1", "Manter as informações do seu perfil atualizadas e precisas.")}</li>
            <li>{t("terms.userResponsibilities.item2", "Respeitar os demais usuários, evitando qualquer comportamento ofensivo, discriminatório ou que viole os direitos de terceiros.")}</li>
            <li>{t("terms.userResponsibilities.item3", "Não compartilhar conteúdo ilegal, enganoso ou prejudicial.")}</li>
          </ul>
        </section>

        <section>
          <h2>{t("terms.misuse.title", "4. Uso Indevido")}</h2>
          <p>
            {t(
              "terms.misuse.text",
              "O uso do AmigosConnect para fins ilícitos ou em desacordo com estes Termos poderá resultar na suspensão ou exclusão de sua conta, além de possíveis ações legais."
            )}
          </p>
        </section>

        <section>
          <h2>{t("terms.changes.title", "5. Alterações nos Termos")}</h2>
          <p>
            {t(
              "terms.changes.text",
              "Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos os usuários sobre alterações significativas com antecedência."
            )}
          </p>
        </section>
      </main>

      <footer className="termos-footer">
        <p>
          {t(
            "terms.contact",
            "Para dúvidas, entre em contato: suporte@amigosconnect.com"
          )}
        </p>
      </footer>
    </div>
  );
};

export default TermosDeUso;
