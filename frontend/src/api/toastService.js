class ToastService {
  toast = null;

  register(toastInstance) {
    this.toast = toastInstance;
  }

  show(severity, summary, detail, life = 4000) {
    if (!this.toast) {
      console.error("ToastService: toast instance not registered");
      return;
    }

    const blockedSummaries = [
      "Requisição completada com sucesso",
      "Ocorreu um erro inesperado",
    ];
    if (blockedSummaries.includes(summary)) {
      console.warn("Toast bloqueado:", { severity, summary, detail });
      return;
    }

    this.toast.show({
      severity,
      summary,
      detail,
      life,
    });
  }

  success(summary, detail) {
    this.show("success", summary, detail);
  }

  error(summary, detail) {
    this.show("error", summary, detail);
  }

  warn(summary, detail) {
    this.show("warn", summary, detail);
  }

  info(summary, detail) {
    this.show("info", summary, detail);
  }
}

const toastService = new ToastService();
export default toastService;
