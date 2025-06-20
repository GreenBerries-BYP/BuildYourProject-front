import React, { useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ProtectedRoute from './auth/ProtectedRoute';
import Logout from './components/Logout';
import { Toast } from 'primereact/toast';
import toastService from './api/toastService';

//App.jsx faz o roteamento da aplicação, definindo as rotas para as páginas de login e registro.
// Ele utiliza o BrowserRouter do react-router-dom para gerenciar as rotas da aplicação.


function App() {
  const toastRef = useRef(null);

  React.useEffect(() => {
    toastService.register(toastRef.current);
  }, []);


  return (
    //aqui agrupamos todo nosso conteúdo com o toast
    <>
      <Toast ref={toastRef} className='p-toast' />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute> <Home /></ProtectedRoute>} />
          <Route path="/logout" element={<ProtectedRoute> <Logout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;