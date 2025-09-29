import React, { useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toast } from 'primereact/toast';

import Login from './pages/Login';
import Register from './pages/Register';
import UseTerms from './pages/UseTerms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ProtectedRoute from './auth/ProtectedRoute';
import toastService from './api/toastService';
import Logout from './components/Logout'
import HomeDefault from './pages/HomeDefault';
import Projetos from './pages/Projetos';
import Compartilhados from './pages/Compartilhados';
import Calendario from './pages/Calendario';
import DadosUsuario from './pages/DadosUsuario';
import InfoPage from './pages/Informacoes';

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
          <Route path="/use_terms" element={<UseTerms />} />
          <Route path="/privacy_policy" element={<PrivacyPolicy />} />

          <Route path="/home" element={<Home />}>
            <Route index element={<HomeDefault />} />
            <Route path="projetos" element={<Projetos />} />
            <Route path="compartilhados" element={<Compartilhados />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="dados_usuario" element={<DadosUsuario />} />
          </Route>

          <Route path="/info" element={<InfoPage />}/>
          <Route path="/logout" element={<ProtectedRoute> <Logout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;