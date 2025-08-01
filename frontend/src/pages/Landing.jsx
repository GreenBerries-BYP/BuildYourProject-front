// Removed useState and api imports as they are not used
import "../styles/Landing.css";
import { MdMenu } from 'react-icons/md';

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
const I18N_STORAGE_KEY = "i18nextLng";

const Landing = () => {
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = useState(
    localStorage.getItem(I18N_STORAGE_KEY)
  );

  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "pt-BR" ? "en-US" : "pt-BR"));
    localStorage.setItem(
      language === "pt-BR" ? "en-US" : "pt-BR",
      I18N_STORAGE_KEY
    );
    i18n.changeLanguage(language === "pt-BR" ? "en-US" : "pt-BR");
  };

  const flagSrc =
    i18n.language === "pt-BR" ? "/imgs/brazil-.png" : "/imgs/united-states.png";
  const flagAlt =
    i18n.language === "pt-BR"
      ? t("altText.brazilFlag", "Brazilian Flag")
      : t("altText.usFlag", "US Flag");

  return (
    <div className="landing-page">
      <div className="decor-items">
        <img className="decor-1" src="/imgs/decor-landing/bx-label.svg" />
        <img className="decor-2" src="/imgs/decor-landing/bx-code-alt.svg" />
        <img
          className="decor-3"
          src="/imgs/decor-landing/bx-check-square.svg"
        />
        <img className="decor-4" src="/imgs/decor-landing/bx-copy-alt.svg" />
        <img className="decor-5" src="/imgs/decor-landing/bxs-calendar.svg" />
      </div>

      <div className="landing-content">
        <header id="landing_header">
          <img
            className="col-4 col-lg-3"
            src="/imgs/logo-horiz.svg"
            alt={t("altText.logoBYP", "BYP Logo")}
          />

          <nav className="d-lg-none navbar navbar-expand-lg p-0">
            <div className="row justify-content-end w-100">
              <button className="navbar-toggler d-lg-none justify-content-end" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <MdMenu size={24} />
              </button>
            </div>
            

            <div className="row collapse navbar-collapse d-lg-none" id="navbarNav">
              <ul className="navbar-nav nav-group flex-column d-lg-none p-0 pb-3">
                <li className="nav-item">
                  <a href="#inicio">{t("landing.nav.home", "home")}</a>
                </li>
                <li className="nav-item">
                  <a href="#ferramentas">{t("landing.nav.tools", "tools")}</a>
                </li>
                <li className="nav-item">
                  <a href="#preview">{t("landing.nav.preview", "preview")}</a>
                </li>
                <li className="nav-item">
                  <a href="#sobre">{t("landing.nav.aboutUs", "about us")}</a>
                </li>
              </ul>

              <ul className="navbar-nav nav-group flex-column d-lg-none justify-content-end">
                <li>
                  <button
                    onClick={toggleLanguage}
                    className="header-icon"
                    aria-label={t("header.changeLanguage")}
                  >
                    <img src={flagSrc} alt={flagAlt} className="bandeira" />
                  </button>
                </li>
                <li>
                  <a className="link-borda-roxo" onClick={() => navigate("/login")}>
                    {t("landing.nav.login", "Fazer login")}
                  </a>
                </li>
                <li>
                  <a className="link-roxo" onClick={() => navigate("/register")}>
                    {t("landing.nav.signUp", "Criar conta")}
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="col-5 col-xl-4 d-none d-lg-flex nav-group">
            <a href="#inicio">{t("landing.nav.home", "home")}</a>
            <a href="#ferramentas">{t("landing.nav.tools", "tools")}</a>
            <a href="#preview">{t("landing.nav.preview", "preview")}</a>
            <a href="#sobre">{t("landing.nav.aboutUs", "about us")}</a>
          </div>

          <div className="col-3 col-xl-4 enter-group d-none d-lg-flex ">
            <button
              onClick={toggleLanguage}
              className="header-icon"
              aria-label={t("header.changeLanguage")}
            >
              <img src={flagSrc} alt={flagAlt} className="bandeira" />
            </button>
            <a className="link-borda-roxo" onClick={() => navigate("/login")}>
              {t("landing.nav.login", "Fazer login")}
            </a>
            <a className="link-roxo" onClick={() => navigate("/register")}>
              {t("landing.nav.signUp", "Criar conta")}
            </a>
          </div>
         
        </header>

        <div id="inicio">
          <div className="topo-inicio">
            <h1 className="titulo-inicio">
              {t(
                "landing.hero.title",
                "Transforme seus Projetos com a Organização que Você Precisa"
              )}
            </h1>
            <p className="descricao-inicio">
              {t(
                "landing.hero.subtitle",
                "Gerencie, colabore e cumpra prazos com tecnologia inteligente."
              )}
            </p>
            <a onClick={() => navigate("/register")} className="botao-comecar link-roxo">
              {t("landing.hero.ctaButton", "Começar agora")}
            </a>
          </div>

          <div className="blocos-inicio row mb-5">
            <div className="bloco-roxo col">
              <img
                className="w-lg-100 w-75"
                src="imgs/ideia.svg"
                alt={t("altText.ideaIcon", "Idea icon")}
              />
              <p>
                {t(
                  "landing.hero.block1Text",
                  "Ferramentas intuitivas para estudantes e grupos acadêmicos"
                )}
              </p>
            </div>
            <div className="bloco-verde col">
              <p>
                {t(
                  "landing.hero.block2Text",
                  "lide com seus projetos de forma eficiente"
                )}
              </p>
            </div>
            <div className="bloco-lilas col">
              <p>{t("landing.hero.block3TextPart1", "do planejamento")}</p>
              <img
                src="imgs/trilha.svg"
                alt={t("altText.pathIcon", "Path icon")}
              />
              <p>{t("landing.hero.block3TextPart2", "à entrega final.")}</p>
            </div>
            <div className="bloco-img col">
              <img
                src="imgs/img-workspace.jpg"
                alt={t("altText.workspaceImage", "Workspace image")}
              />
            </div>
          </div>
        </div>

        <div id="ferramentas">
          <h2 className="titulo-ferramentas">
            {t("landing.toolsInfo.title", "Conheça nossas ferramentas")}
          </h2>
          <div className="row grade-ferramentas">
            <div className="bloco-ferramenta col-sm-5 col-lg-3">
              <img
                src="imgs/decor-landing/icons-ferramentas/cube.svg"
                alt={t("altText.cubeIcon", "Cube icon")}
              />
              <div className="bloco-text">
                <h3>
                  {t(
                    "landing.toolsInfo.modularPlanning.title",
                    "Planejamento Modular"
                  )}
                </h3>
                <p>
                  {t(
                    "landing.toolsInfo.modularPlanning.description",
                    "Divida seu TCC ou projeto em etapas claras e gerenciáveis."
                  )}
                </p>
              </div>
            </div>
            <div className="bloco-ferramenta col-sm-5 col-lg-3">
              <img
                src="imgs/decor-landing/icons-ferramentas/refresh.svg"
                alt={t("altText.refreshIcon", "Refresh icon")}
              />
              <div className="bloco-text">
                <h3>
                  {t(
                    "landing.toolsInfo.deadlineRecalculation.title",
                    "Recalculagem de Prazos"
                  )}
                </h3>
                <p>
                  {t(
                    "landing.toolsInfo.deadlineRecalculation.description",
                    "Atrasou uma entrega? O BYP ajusta automaticamente seu cronograma."
                  )}
                </p>
              </div>
            </div>
            <div className="bloco-ferramenta col-sm-5 col-lg-3">
              <img
                src="imgs/decor-landing/icons-ferramentas/users.svg"
                alt={t("altText.usersIcon", "Users icon")}
              />
              <div className="bloco-text">
                <h3>
                  {t(
                    "landing.toolsInfo.realTimeCollaboration.title",
                    "Colaboração em Tempo Real"
                  )}
                </h3>
                <p>
                  {t(
                    "landing.toolsInfo.realTimeCollaboration.description",
                    "Adicione colegas, oriente interações, e acompanhe o progresso conjunto."
                  )}
                </p>
              </div>
            </div>
            <div className="bloco-ferramenta col-sm-5 col-lg-3">
              <img
                src="imgs/decor-landing/icons-ferramentas/notifications.svg"
                alt={t("altText.notificationsIcon", "Notifications icon")}
              />
              <div className="bloco-text">
                <h3>
                  {t(
                    "landing.toolsInfo.alertsAndReminders.title",
                    "Alertas e Lembretes"
                  )}
                </h3>
                <p>
                  {t(
                    "landing.toolsInfo.alertsAndReminders.description",
                    "Nunca perca um prazo ou atividade importante."
                  )}
                </p>
              </div>
            </div>
            <div className="bloco-ferramenta col-sm-5 col-lg-3">
              <img
                src="imgs/decor-landing/icons-ferramentas/devices.svg"
                alt={t("altText.devicesIcon", "Devices icon")}
              />
              <div className="bloco-text">
                <h3>
                  {t(
                    "landing.toolsInfo.responsiveWebVersion.title",
                    "Versão Web Responsiva"
                  )}
                </h3>
                <p>
                  {t(
                    "landing.toolsInfo.responsiveWebVersion.description",
                    "Acesse de qualquer lugar, em qualquer dispositivo."
                  )}
                </p>
              </div>
            </div>
            <div className="bloco-ferramenta col-sm-5 col-lg-3">
              <img
                src="imgs/decor-landing/icons-ferramentas/bot.svg"
                alt={t("altText.botIcon", "Bot icon")}
              />
              <div className="bloco-text">
                <h3>
                  {t("landing.toolsInfo.integratedAI.title", "IA integrada")}
                </h3>
                <p>
                  {t(
                    "landing.toolsInfo.integratedAI.description",
                    "Dúvidas? Pergunte à Berry, nossa IA ajudante!"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <img className="wave" src="/imgs/wave.svg" alt="" />{" "}
        
        <div id="preview">
          
          <h1>{t("landing.previewInfo.title", "Preview")}</h1>
          <p>{t("landing.previewInfo.subtitle", "Veja como é o BYP")}</p>
          <div
            id="carouselPreviewControls"
            className="carousel slide pb-5"
            data-bs-ride="carousel"
          >
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img
                  className="d-block w-100"
                  src="/imgs/preview-pages/aba-aberta.svg"
                  alt={t("landing.previewInfo.altHome", "home")}
                />
              </div>
              <div className="carousel-item">
                <img
                  className="d-block w-100"
                  src="/imgs/preview-pages/com-modal.svg"
                  alt={t("landing.previewInfo.altCreateProject", "criar projeto")}
                />
              </div>
              <div className="carousel-item">
                <img
                  className="d-block w-100"
                  src="/imgs/preview-pages/visao-projeto.svg"
                  alt={t("landing.previewInfo.altViewProject", "visualizar projeto")}
                />
              </div>
            </div>

            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselPreviewControls"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">
                {t("landing.previewInfo.previousSlide", "Previous")}
              </span>
            </button>

            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselPreviewControls"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">
                {t("landing.previewInfo.nextSlide", "Next")}
              </span>
            </button>
          </div>

        </div>

        <div id="sobre">
          <div className="titulo-sobre">
            <h1>{t("landing.about.title", "Sobre a GreenBerries")}</h1>
            <p>{t("landing.about.subtitle", "Conheça nosso colaboradores")}</p>
          </div>
          <div className="row sobre-content">
            <div className="col-12 col-lg-4 quem-somos">
              <h2 className="text-center">
                {t("landing.about.whoWeAreTitle", "Quem somos?")}
              </h2>
              <p>
                {t(
                  "landing.about.whoWeAreParagraph1",
                  "Somos um grupo de estudantes e desenvolvedores apaixonados por resolver o caos dos projetos acadêmicos."
                )}
                <br />
                <br />
                {t(
                  "landing.about.whoWeAreParagraph2",
                  "Criamos o BYP com base nas dificuldades comuns dos estudantes com a organização de projetos — e transformamos isso em uma solução eficiente, colaborativa e realmente útil para qualquer projeto."
                )}
              </p>
            </div>
            <div className="col-12 col-lg-6 integrantes">
              <div className="col-5 col-lg-3">
                <img src="imgs/integrantes/joao.png" alt="João Félix" />
                <p>João Félix</p>
              </div>
              <div className="col-5 col-lg-3">
                <img src="imgs/integrantes/jo.png" alt="Jossana Tavares" />
                <p>Jossana Tavares</p>
              </div>
              <div className="col-5 col-lg-3">
                <img src="imgs/integrantes/let.png" alt="Leticia Rudeli" />
                <p>Leticia Rudeli</p>
              </div>
              <div className="col-5 col-lg-3">
                <img src="imgs/integrantes/maris.png" alt="Marisa Morita" />
                <p>Marisa Morita</p>
              </div>
              <div className="col-5 col-lg-3">
                <img src="imgs/integrantes/mih.png" alt="Millena Cupolillo" />
                <p>Millena Cupolillo</p>
              </div>
              <div className="col-5 col-lg-3">
                <img src="imgs/integrantes/rodrigo.png" alt="Rodrigo Bettio" />
                <p>Rodrigo Bettio</p>
              </div>
            </div>
          </div>
        </div>

        <footer>
          <div className="footer-start row">
            <div className="logos col-lg-4 col-sm-4">
              <img
                className="w-50 pb-5"
                src="/imgs/logo-horiz.svg"
                alt={t("altText.logoBYP", "BYP Logo")}
              />
              <p>
                {t(
                  "landing.footer.developedBy",
                  "Este projeto foi desenvolvido por:"
                )}
              </p>
              <img
                className="w-50"
                src="imgs/logo-horiz-greenberries.svg"
                alt={t("altText.logoGreenberries", "GreenBerries Logo")}
              />
            </div>
            <div className="text-end pt-5 px-3 col-lg-4 col-sm-3">
              <h3>{t("landing.footer.documentationTitle", "Documentação")}</h3>
              <p>
                {t("landing.footer.documentationLinkText", "Documentação:")}
                <br /> 
                <a className="text-dark" href="https://www.overleaf.com/project/67f168707c869626a81a641f">
                https://www.overleaf.com/<br />project/<br />67f168707c869626a81a641f
                </a>
                {" "}
              </p>
            </div>
            <div className="text-end pt-5 px-3 contatos col-lg-4 col-sm-4">
              <h3>{t("landing.footer.contactsTitle", "Contatos")}</h3>
              <p>
                {t("landing.footer.emailLabel", "Email:")} <br />
                greenberriesbyp@gmail.com
              </p>
              <p>
                {t("landing.footer.youtubeLabel", "Youtube:")} <br />
                <a className="text-dark" href="https://www.youtube.com/@GreenBerries-byp">
                https://www.youtube.com/<br />@GreenBerries-byp
                </a>
                {" "}
              </p>
            </div>
          </div>
          <hr />
          <div className="end-footer">
            <p>
              {t(
                "landing.footer.copyright",
                "@ 2025 GreenBerries All rights reserved"
              )}
            </p>
            <div className="links">
              <a href="/terms">
                {t("landing.footer.termsLink", "Termos e condições")}
              </a>
              <a href="/politics ">
                {t("landing.footer.privacyLink", "Política de privacidade")}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

window.addEventListener("scroll", function () {
  const header = document.getElementById("landing_header");
  if (window.scrollY > 50) {
    header?.classList?.add("sticky");
  } else {
    header?.classList?.remove("sticky");
  }
});

export default Landing;
