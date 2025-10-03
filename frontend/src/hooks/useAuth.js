import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/authContext";
import { saveToken } from "../auth/auth";
import { useState } from "react";
import { API_ENDPOINTS } from "../constants/auth";

import { jwtDecode } from "jwt-decode";

import toastService from "../api/toastService";
import api from "../api/api";
import axios from "axios";
import { saveToken, setGoogleLoginStatus } from "../auth/auth"; 

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const login = async ({ email, senha, manterLogado }) => {
    setIsLoading(true);
    try {
      const res = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password: senha,
      });
      if (res.data && res.data.access) {
        saveToken(res.data.access, manterLogado, res.data.refresh);

        const userData = jwtDecode(res.data.access);
        setUser(userData);

        toastService.success("Bem-vindo!", "Login realizado com sucesso.");
        navigate("/home");
      } else {
        toastService.error(
          "Erro de Resposta",
          "O servidor não retornou uma credencial válida."
        );
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toastService.error("Falha no login", "E-mail ou senha incorretos.");
      } else {
        toastService.error("Erro no servidor", "Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.REGISTER, {
        full_name: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toastService.success(
        "Cadastro realizado!",
        "Sua conta foi criada com sucesso. Faça o login para continuar."
      );
      navigate("/login");
    } catch (err) {
      const errorMessage =
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        "Dados inválidos ou já existentes.";
      toastService.error("Falha no cadastro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credentialResponse) => {
  setIsGoogleLoading(true);
  try {
    const idToken = credentialResponse.credential;
    
    if (!idToken) {
      toastService.error("Erro no login", "ID Token não recebido do Google.");
      return;
    }
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api${API_ENDPOINTS.GOOGLE_LOGIN}`,
      {
        access_token: idToken, 
      }
    );

    console.log("Resposta do backend:", response.data);
    const token = response.data.access;
    
    if (!token) {
      toastService.error("Erro no login", "Token não recebido do servidor.");
      return;
    }

    saveToken(token, false, response.data.refresh);
    setGoogleLoginStatus(true); 

    const userData = jwtDecode(token);
    setUser(userData);

    await new Promise(resolve => setTimeout(resolve, 100));
    
    toastService.success("Bem-vindo!", "Login com Google realizado com sucesso.");
    navigate("/home");
  } catch (error) {
    console.error("Erro completo no login com Google:", error);
    console.error("Detalhes do erro:", error.response?.data);
    //debug
    if (error.config?.data) {
      console.log("📤 Payload enviado:", error.config.data);
    }
    
    // Adicione tratamento de erro mais específico
    if (error.response?.status === 400) {
      const errorDetails = error.response.data;
      console.error("Detalhes do erro 400:", errorDetails);
      
      const errorMessage = errorDetails?.error || 
                          errorDetails?.details || 
                          "Token do Google inválido ou expirado.";
      toastService.error("Falha no login", errorMessage);
    } else {
      toastService.error("Erro no servidor", "Tente novamente mais tarde.");
    }
  } finally {
    setIsGoogleLoading(false);
  }
};

  return { isLoading, isGoogleLoading, login, register, googleLogin };
};
