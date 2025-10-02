import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/authContext";
import { saveToken } from "../auth/auth";
import { useState } from "react";
import { API_ENDPOINTS } from "../constants/auth";

import { jwtDecode } from "jwt-decode";

import toastService from "../api/toastService";
import api from "../api/api";
import axios from "axios";

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

  const googleLogin = async (tokenResponse) => {
  setIsGoogleLoading(true);
  try {
    // Pega o token correto: credential (GIS moderno) ou access_token (legado)
    const token = tokenResponse.access_token || tokenResponse.credential;

    if (!token) {
      throw new Error("Google login retornou token inválido.");
    }

    // Envia para o backend
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api${API_ENDPOINTS.GOOGLE_LOGIN}`,
      { access_token: token } // chave que o backend espera
    );

    // Recebe JWT do backend
    const { token: jwtToken } = response.data;

    // Salva token localmente (cookies ou localStorage)
    saveToken(jwtToken);

    // Decodifica JWT e salva dados do usuário no contexto
    const userData = jwtDecode(jwtToken);
    setUser(userData);

    // Redireciona para home
    navigate("/home");
  } catch (error) {
    console.error("Erro no login com Google:", error);
    toastService.error(
      "Falha no login",
      "Não foi possível realizar o login com Google. Tente novamente."
    );
  } finally {
    setIsGoogleLoading(false);
  }
};


  return { isLoading, isGoogleLoading, login, register, googleLogin };
};
