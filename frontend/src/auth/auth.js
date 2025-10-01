// src/auth/auth.js

import jwtDecode from "jwt-decode"; 
import { STORAGE_KEYS } from "../constants/auth";

export const saveToken = (token, keepLogged = false, refreshToken = null) => {
  if (!token) {
    console.error("Tentativa de salvar um token nulo.");
    return;
  }
  const storage = keepLogged ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);

  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

 
  try {
    const decoded = jwtDecode(token);
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(decoded));
  } catch (err) {
    console.error("Erro ao decodificar token ao salvar:", err);
  }
};

export const getToken = () => {
  return (
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  );
};

export const getRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_INFO); // mantém limpeza
};

// ✅ helper extra para recuperar usuário salvo
export const getUserInfo = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp && decoded.exp > currentTime;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    removeToken();
    return false;
  }
};

export const getGoogleLoginStatus = () => {
  return !!localStorage.getItem("google_access_token");
};
