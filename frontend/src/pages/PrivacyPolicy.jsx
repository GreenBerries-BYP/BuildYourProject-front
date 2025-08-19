import "../styles/PrivacyTerms.css";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(
    localStorage.getItem(I18N_STORAGE_KEY)
  );

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

  return (
    <div className="termos-politicas-page">
      <header>
        <h1>{t("privacy.title", "Política de Privacidade")}</h1>
        <p>{t("privacy.lastUpdate", "Última atualização: 1 de dezembro de 2024")}</p>
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
      </header>

      <section>
        <h2>{t("privacy.dataCollection.title", "1. Coleta de Dados")}</h2>
        <p>{t(
          "privacy.dataCollection.text",
          "Coletamos informações pessoais como nome, e-mail e preferências para oferecer uma experiência personalizada. Dados adicionais podem ser coletados com seu consentimento durante o uso de certos recursos."
        )}</p>
      </section>

      <section>
        <h2>{t("privacy.dataUsage.title", "2. Uso das Informações")}</h2>
        <p>{t(
          "privacy.dataUsage.text",
          "Os dados coletados são utilizados para:"
        )}</p>
        <ul>
          <li>{t("privacy.dataUsage.item1", "Personalizar sua experiência na plataforma.")}</li>
          <li>{t("privacy.dataUsage.item2", "Facilitar a organização de eventos e conexões sociais.")}</li>
          <li>{t("privacy.dataUsage.item3", "Garantir segurança e prevenir atividades ilícitas.")}</li>
        </ul>
      </section>

      <section>
        <h2>{t("privacy.dataSharing.title", "3. Compartilhamento de Dados")}</h2>
        <p>{t(
          "privacy.dataSharing.text",
          "O AmigosConnect não compartilha informações pessoais com terceiros sem o seu consentimento, exceto quando exigido por lei ou para proteger os direitos da plataforma e de seus usuários."
        )}</p>
      </section>

      <section>
        <h2>{t("privacy.security.title", "4. Segurança")}</h2>
        <p>{t(
          "privacy.security.text",
          "Implementamos medidas técnicas e organizacionais para proteger suas informações contra acessos não autorizados, perda ou uso indevido."
        )}</p>
      </section>

      <section>
        <h2>{t("privacy.yourRights.title", "5. Seus Direitos")}</h2>
        <p>{t(
          "privacy.yourRights.text",
          "Você pode acessar, corrigir ou excluir suas informações pessoais a qualquer momento. Entre em contato conosco para exercer esses direitos."
        )}</p>
      </section>

      <footer>
        <p>{t(
          "privacy.contact",
          "Para dúvidas ou solicitações, entre em contato: privacidade@amigosconnect.com"
        )}</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
