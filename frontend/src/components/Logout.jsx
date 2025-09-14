// src/pages/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../auth/auth';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    removeToken();

    // Remove cookies de sessão
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie =
        name.trim() +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";
    });

    document.body.classList.remove('dark-theme');
    navigate('/');
  }, [navigate]);

  return null; // Não renderiza nada
};

export default Logout;
