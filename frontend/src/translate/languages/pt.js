const pt = {
  landing: {
    nav: {
      home: "início",
      tools: "ferramentas",
      preview: "preview",
      aboutUs: "sobre nós",
      login: "Login",
      signUp: "Criar conta",
    },
    hero: {
      title: "Transforme seus Projetos com a Organização que Você Precisa",
      subtitle: "Gerencie, colabore e cumpra prazos com tecnologia inteligente.",
      ctaButton: "Começar agora",
      block1Text: "Ferramentas intuitivas para estudantes e grupos acadêmicos",
      block2Text: "lide com seus projetos de forma eficiente",
      block3TextPart1: "do planejamento",
      block3TextPart2: "à entrega final.",
    },
    toolsInfo: {
      title: "Conheça nossas ferramentas",
      modularPlanning: {
        title: "Planejamento Modular",
        description: "Divida seu TCC ou projeto em etapas claras e gerenciáveis."
      },
      deadlineRecalculation: {
        title: "Recalculagem de Prazos",
        description: "Atrasou uma entrega? O BYP ajusta automaticamente seu cronograma."
      },
      realTimeCollaboration: {
        title: "Colaboração em Tempo Real",
        description: "Adicione colegas, oriente interações, e acompanhe o progresso conjunto."
      },
      alertsAndReminders: {
        title: "Alertas e Lembretes",
        description: "Nunca perca um prazo ou atividade importante."
      },
      responsiveWebVersion: {
        title: "Versão Web Responsiva",
        description: "Acesse de qualquer lugar, em qualquer dispositivo."
      },
      integratedAI: {
        title: "IA integrada",
        description: "Dúvidas? Pergunte à Berry, nossa IA ajudante!"
      }
    },
    previewInfo: {
      title: "Preview",
      subtitle: "Veja como é o BYP",
      altHome: "home",
      altCreateProject: "criar projeto",
      altViewProject: "visualizar projeto",
      previousSlide: "Anterior",
      nextSlide: "Próximo",
    },
    about: {
      title: "Sobre a GreenBerries",
      subtitle: "Conheça nosso colaboradores",
      whoWeAreTitle: "Quem somos?",
      whoWeAreParagraph1: "Somos um grupo de estudantes e desenvolvedores apaixonados por resolver o caos dos projetos acadêmicos.",
      whoWeAreParagraph2: "Criamos o BYP com base nas dificuldades comuns dos estudantes com a organização de projetos — e transformamos isso em uma solução eficiente, colaborativa e realmente útil para qualquer projeto."
    },
    footer: {
      developedBy: "Este projeto foi desenvolvido por:",
      documentationTitle: "Documentação",
      documentationLinkText: "Documentação:",
      contactsTitle: "Contatos",
      emailLabel: "Email:",
      youtubeLabel: "Youtube:",
      copyright: "@ 2025 GreenBerries All rights reserved",
      termsLink: "Termos e condições",
      privacyLink: "Política de privacidade",
    }
  },
  login: {
    emailLabel: "Email",
    emailPlaceholder: "exemplo@dominio.com",
    passwordLabel: "Senha",
    passwordPlaceholder: "Digite sua senha",
    invalidCredentials: "Credenciais inválidas. Verifique seu e-mail e senha.",
    forgotPasswordLink: "Esqueci ou quero alterar minha senha",
    keepLoggedIn: "Manter-me logado",
    register: "Cadastre-se",
    signIn: "Entrar",
    loading: "Carregando...",
    lowercase: "Pelo menos uma letra minúscula",
    uppercase: "Pelo menos uma letra maiúscula",
    especialCaracter: "Pelo menos um caractere especial",
    number: "Pelo menos um número",
    suggestions: "Sugestões para uma senha forte:",
  },
  register: {
    fullNameLabel: "Nome completo:",
    fullNamePlaceholder: "Digite seu nome completo",
    usernameLabel: "Usuário:",
    usernamePlaceholder: "Digite seu nome de usuário",
    emailLabel: "Email:",
    emailPlaceholder: "Digite seu email",
    passwordLabel: "Senha:",
    passwordPlaceholder: "Digite sua senha",
    confirmPasswordLabel: "Confirmar Senha:",
    confirmPasswordPlaceholder: "Confirme sua senha",
    errorPasswordMismatch: "As senhas não coincidem.",
    errorAcceptTerms: "Você precisa aceitar os termos de uso e políticas de privacidade.",
    errorRegistrationFailed: "Erro ao cadastrar. Verifique os dados e tente novamente.",
    terms: {
      intro: "Ao criar uma conta nessa aplicação eu declaro que aceito os",
      termsLinkText: "termos de uso",
      and: "e as",
      policyLinkText: "políticas de privacidade",
    },
    submitButton: "Realizar Cadastro",
  },
  projectCard: {
    progressLabel: "Progresso",
  },
  viewProject: {
    createdBy: "Criado por: {{adm}}",
    membersCount: "{{count}} integrantes",
    taskHeaderTask: "Tarefa",
    taskHeaderResponsible: "Responsável",
    taskHeaderStatus: "Status",
    taskHeaderDueDate: "Prazo",
    collaboratorsTitle: "Colaboradores",
  },
  header: {
    title: "Build Your Project",
    notifications: "Notificações",
    switchToLightMode: "Mudar para Modo Claro",
    switchToDarkMode: "Mudar para Modo Escuro",
    changeLanguage: "Mudar Idioma",
    userProfile: "Perfil do Usuário",
  },
  titles: {
    title: "Build your Project",
    newProject: "Novo Projeto",
    editProject: "Editar Projeto",
    step1BasicInfo: "Etapa 1: Informações Básicas",
    step2DatesAndCollabs: "Etapa 2: Datas e Colaboradores",
    step3Review: "Etapa 3: Revisão dos Detalhes do Projeto",
    projectDetails: "Detalhes do Projeto",
    collaborators: "Colaboradores",
    datesAndCollaborators: "Datas e Colaboradores",
    newTask: "Nova Tarefa"
  },
  messages: {
    welcome: "Bem-vindo ao Build Your Project",
    searchPlaceholder: "Pesquisar...",
    darkMode: "Modo Escuro",
    lightMode: "Modo Claro",
    notifications: "Notificações",
    userProfile: "Perfil do Usuário",
    changeLanguage: "Mudar Idioma",

    emailCantBeEmpty: "Email não pode estar vazio",
    invalidEmailFormat: "Formato de email inválido",
    emailAlreadyAdded: "Este email já foi adicionado",
    projectNameRequired: "Nome do projeto é obrigatório",
    projectDescriptionRequired: "Descrição do projeto é obrigatória",
    errorNewProject: "Erro ao criar novo projeto",
    errorNewProjectBackendNotReady: "Falha ao criar projeto. O serviço pode estar indisponível ou acesso não autorizado. Tente novamente mais tarde.",
    taskNameRequired: "Nome da tarefa é obrigatório",
    taskDescriptionRequired: "Descrição da tarefa é obrigatória",
    dueDateRequired: "Data de entrega é obrigatória",
    responsibleRequired: "Responsável é obrigatório",
    errorNewTask: "Erro ao criar nova tarefa",
    emailMessage: "Insira o email e pressione Enter",
    reviewProjectDetails: "Por favor, revise os detalhes do seu projeto antes de enviar.",
    notSpecified: "N/D",
    noCollaborators: "N/D",
    startDateRequired: "Data de início é obrigatória.",
    endDateRequired: "Data de término é obrigatória.",
    endDateAfterStartDate: "Data de término não pode ser anterior à data de início.",
  },
  buttons: {
    createProject: "Criar Projeto",
    deleteProject: "Apagar Projeto",
    saveTask: "Salvar ✓",
    viewDetails: "Ver Detalhes",
    add: "Adicionar",
    edit: "Editar",
    delete: "Excluir",
    save: "Salvar",
    saving: "Salvando...",
    previous: "Anterior",
    next: "Próximo",
    readLess: "Ler menos",
    readMore: "Ler mais",
    newTask: "Nova Tarefa",
  },
  sideBar: {
    home: "Início",
    myProjects: "Meus Projetos",
    myTasks: "Minhas Tarefas",
    sharedWithMe: "Compartilhados\nComigo",
    googleCalendar: "Google Agenda",
    info: "Informações",
    logOut: "Sair",
  },
  inputs: {
    name: "Nome do Projeto",
    description: "Descrição do Projeto",
    descriptionShort: "Descrição",
    email: "E-mail",
    projectType: "Tipo de Projeto",
    phases: "Etapas",
    taskName: "Nome da Tarefa",
    taskDescription: "Descrição da Tarefa",
    selectResponsible: "Selecione um responsável:",
    selectPhase: "Selecione uma Etapa",
    startDate: "Data de Início",
    endDate: "Data de Término",
    academicArticle: "Artigo Acadêmico"
  },
  placeholders: {
    projectName: "Insira o nome do projeto",
  },
  steps: {
    basicInfo: "Info Básicas",
    datesAndCollaborators: "Datas e Colaboradores",
    review: "Revisão",
  },
  project: {
    yourTasks: "Suas Tarefas",
  },
  abntTemplates: {
    cover: "Capa",
    titlePage: "Folha de Rosto",
    dedication: "Dedicatória",
    acknowledgements: "Agradecimentos",
    abstract: "Resumo",
    abstractEnglish: "Abstract (Inglês)",
    summary: "Sumário",
    introduction: "Introdução",
    development: "Desenvolvimento",
    methodology: "Metodologia",
    results: "Resultados",
    conclusion: "Conclusão",
    references: "Referências"
  }
};

export default pt;
