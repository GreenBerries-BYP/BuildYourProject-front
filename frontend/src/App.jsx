import React, { useRef, createContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ProtectedRoute from './auth/ProtectedRoute';
import Logout from './components/Logout';
import { Toast } from 'primereact/toast';
import { useToast } from './services/toastService';

//App.jsx faz o roteamento da aplicação, definindo as rotas para as páginas de login e registro.
// Ele utiliza o BrowserRouter do react-router-dom para gerenciar as rotas da aplicação.

//const do contexto do toast - onde ele será usado no html
export const ToastContext = createContext();

function App() {
  const toastRef = useRef(null);
  const toastUtils = useToast();

  useEffect(() => {
    const handleShowToastEvent = (event) => {
      const { severity, summary, detail } = event.detail;
      switch (severity) {
        case 'success':
          toastUtils.showSuccessToast(summary, detail);
          break;
        case 'error':
          toastUtils.showErrorToast(summary, detail);
          break;
        case 'warn':
          toastUtils.showWarnToast(summary, detail);
          break;
        case 'info':
          toastUtils.showInfoToast(summary, detail);
          break;
        default:
          console.warn('Unknown toast severity:', severity);
          break;
      }
    };

    window.addEventListener('show-toast', handleShowToastEvent);

    return () => {
      window.removeEventListener('show-toast', handleShowToastEvent);
    };
  }, [toastUtils]); // roda dnv se o toastUtils mudar


  return (
    //aqui agrupamos todo nosso conteúdo com o toast

    <ToastContext.Provider value={toastRef}>
      <Toast ref={toastRef}/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute> <Home /></ProtectedRoute>} />
          <Route path="/logout" element={<ProtectedRoute> <Logout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ToastContext.Provider>
  );
}
export default App;