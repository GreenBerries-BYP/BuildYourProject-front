import { useContext } from 'react';
import { ToastContext } from '../App'; // Adjust the path if App.jsx is located elsewhere

// Custom hook to access toast functions
export const useToast = () => {
  const toastRef = useContext(ToastContext);

  if (!toastRef) {
    // This might happen if the context provider is not correctly set up
    // or if useToast is called outside of a component wrapped by ToastContext.Provider
    console.error("ToastContext is not available. Make sure useToast is called within a component wrapped by ToastContext.Provider.");
    // Return no-op functions or throw an error, depending on desired error handling
    return {
      showSuccessToast: () => console.error("Toast not available"),
      showErrorToast: () => console.error("Toast not available"),
      showWarnToast: () => console.error("Toast not available"),
      showInfoToast: () => console.error("Toast not available"),
    };
  }

  const showToast = (severity, summary, detail) => {
    if (toastRef.current) {
      toastRef.current.show({ severity, summary, detail, life: 3000 });
    } else {
      console.error("Toast reference (toastRef.current) is not available.");
    }
  };

  return {
    showSuccessToast: (summary, detail) => showToast('success', summary, detail),
    showErrorToast: (summary, detail) => showToast('error', summary, detail),
    showWarnToast: (summary, detail) => showToast('warn', summary, detail),
    showInfoToast: (summary, detail) => showToast('info', summary, detail),
  };
};
