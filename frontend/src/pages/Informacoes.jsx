
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useNavigate } from "react-router-dom";


import '../styles/Home.css';
import '../styles/Informacoes.css';

function InfoPage() {
    const { t } = useTranslation();
    const supportEmail = 'greenberries@gmail.com';
    const navigate = useNavigate();


    return (
        <div className="info-page-container">
            <div className='d-flex justify-content-between align-items-center  w-100'>
                <h2>{t('infoPage.title', 'Central de Ajuda e Informações')}</h2>
                <Button label={t('infoPage.back')} onClick={() => navigate('/home')} icon='pi pi-arrow-left' className='btn-back'></Button>
            </div>

            <Card className="info-card">
                <div className="info-section">
                    <h3>{t('infoPage.contact.title', 'Entre em Contato')}</h3>
                    <div className="contact-content">
                        <Avatar icon="pi pi-envelope" size="large" shape="circle" />
                        <div className="contact-details">
                            <p>{t('infoPage.contact.description', 'Para dúvidas, sugestões ou suporte técnico, envie um e-mail para:')}</p>
                            <a href={`mailto:${supportEmail}`} className="support-email">{supportEmail}</a>
                        </div>
                    </div>
                </div>

                {/* Seção de Perguntas Frequentes (FAQ) */}
                <div className="info-section">
                    <h3>{t('infoPage.faq.title', 'Perguntas Frequentes (FAQ)')}</h3>
                    <Accordion activeIndex={0}>
                        <AccordionTab header={t('infoPage.faq.q1.question', 'O que é a plataforma Build Your Project?')}>
                            <p>{t('infoPage.faq.q1.answer', 'A Build Your Project (BYP) é uma plataforma projetada para ajudar desenvolvedores e equipes a gerenciar seus projetos de software, desde a concepção até a implantação, de forma organizada e eficiente.')}</p>
                        </AccordionTab>
                        <AccordionTab header={t('infoPage.faq.q2.question', 'Como posso alterar meus dados cadastrais?')}>
                            <p>{t('infoPage.faq.q2.answer', 'Você pode alterar seu nome, nome de usuário e e-mail acessando a página "Meus Dados" através do menu de navegação. Lembre-se de salvar as alterações após a edição.')}</p>
                        </AccordionTab>
                        <AccordionTab header={t('infoPage.faq.q3.question', 'Esqueci minha senha, o que faço?')}>
                            <p>{t('infoPage.faq.q3.answer', 'Na página "Meus Dados", clique no botão "Alterar Senha". Um modal aparecerá com as instruções para que você possa redefinir sua senha com segurança.')}</p>
                        </AccordionTab>
                        <AccordionTab header={t('infoPage.faq.q4.question', 'É seguro excluir minha conta?')}>
                            <p>{t('infoPage.faq.q4.answer', 'A exclusão de conta é uma ação permanente e irreversível. Todos os seus projetos e dados associados serão removidos de nossa plataforma. Proceda com cautela.')}</p>
                        </AccordionTab>
                    </Accordion>
                </div>

                {/* Seção de Links Úteis */}
                <div className="info-section">
                    <h3>{t('infoPage.links.title', 'Links Úteis')}</h3>
                    <div className="useful-links">
                        <Button label={t('infoPage.links.terms', 'Termos de Serviço')} icon="pi pi-file" className="p-button-text" />
                        <Button label={t('infoPage.links.privacy', 'Política de Privacidade')} icon="pi pi-shield" className="p-button-text" />
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default InfoPage;