class ToastService {
  toast = null;

  register(toastInstance) {
    this.toast = toastInstance;
  }

  show(severity, summary, detail) {
    if (this.toast) {
      this.toast.show({
        severity,
        summary,
        detail,
        life: 4000,
      });
    } else {
      console.error('ToastService: toast instance not registered');
    }
  }

  success(summary, detail) {
    this.show('success', summary, detail);
  }

  error(summary, detail) {
    this.show('error', summary, detail);
  }

  warn(summary, detail) {
    this.show('warn', summary, detail);
  }

  info(summary, detail) {
    this.show('info', summary, detail);
  }
}

const toastService = new ToastService();
export default toastService;
