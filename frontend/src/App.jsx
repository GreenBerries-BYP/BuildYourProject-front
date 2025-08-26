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

        <Route path="/home" element={<ProtectedRoute> <Home /></ProtectedRoute>}>
          <Route index element={ <HomeDefault/> }/>
          <Route path="projetos" element={ <Projetos />}/>
          <Route path="compartilhados" element={ <Compartilhados />}/>
        </Route>
        
        <Route path="/logout" element={<ProtectedRoute> <Logout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;