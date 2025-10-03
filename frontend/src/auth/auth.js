// src/auth/auth.js

import { STORAGE_KEYS } from "../constants/auth";
import { jwtDecode } from "jwt-decode";

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

export const getGoogleLoginStatus = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('google_logged_in') === 'true';
};

export const setGoogleLoginStatus = (status) => {
  if (typeof window === 'undefined') return;
  if (status) {
    localStorage.setItem('google_logged_in', 'true');
  } else {
    localStorage.removeItem('google_logged_in');
    localStorage.removeItem('google_access_token'); // Remove o token antigo também
  }
};

export const getGoogleToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('google_access_token');
};

export const saveGoogleToken = (token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('google_access_token', token);
};
