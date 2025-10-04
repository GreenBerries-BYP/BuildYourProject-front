import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "primereact/card";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useNavigate } from "react-router-dom";
import "../styles/Informacoes.css";

function InfoPage() {
  const { t } = useTranslation();
  const supportEmail = "greenberries@gmail.com";
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <div className="d-flex justify-content-between align-items-center  w-100">
        <h2 className="fs-1">{t("infoPage.title")}</h2>
        <Button
          label={t("infoPage.back")}
          onClick={() => navigate("/home")}
          icon="pi pi-arrow-left"
          className="btn-back mb-3"
        ></Button>
      </div>

      <div className="info-card">
        <div className="info-section">
          <h3 className="subtitles">{t("infoPage.contactTitle")}</h3>
          <div className="contact-content border rounded p-3">
            <div className="contact-details">
              <p className="mt-2">{t("infoPage.contactDescription")}</p>
              <div className="d-flex align-items-center">
                <Avatar icon="pi pi-envelope" size="large" shape="circle" />
                <a
                  href={`mailto:${supportEmail}`}
                  className="support-email fs-5 ms-2"
                >
                  {supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3 className="subtitles">{t("infoPage.faqTitle")}</h3>
          <Accordion activeIndex={0}>
            <AccordionTab className="acordion-tab" header={t("infoPage.faqQ1")}>
              <p>{t("infoPage.faqA1")}</p>
            </AccordionTab>
            <AccordionTab className="acordion-tab" header={t("infoPage.faqQ2")}>
              <p>{t("infoPage.faqA2")}</p>
            </AccordionTab>
            <AccordionTab className="acordion-tab" header={t("infoPage.faqQ3")}>
              <p>{t("infoPage.faqA3")}</p>
            </AccordionTab>
            <AccordionTab className="acordion-tab" header={t("infoPage.faqQ4")}>
              <p>{t("infoPage.faqA4")}</p>
            </AccordionTab>
          </Accordion>
        </div>

        <div className="info-section">
          <h3 className="subtitles">{t("infoPage.linksTitle")}</h3>
          <div className="useful-links border rounded p-3">
            <Button
              label={t("infoPage.linksTerms")}
              icon="pi pi-file"
              className="p-button-text fs-4"
              onClick={() => navigate("/use_terms")}
            />
            <Button
              label={t("infoPage.linksPrivacyPolicy")}
              icon="pi pi-shield"
              className="p-button-text fs-4"
              onClick={() => navigate("/privacy_policy")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
