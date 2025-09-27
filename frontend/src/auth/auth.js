export const saveToken = (token, keepLogged = false, refreshToken = null) => {
  if (!token) {
    console.error("Token não fornecido para saveToken");
    return;
  }
  
  removeToken();

  if (keepLogged) {
    localStorage.setItem("access_token", token);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
  } else {
    sessionStorage.setItem("access_token", token);
    if (refreshToken) sessionStorage.setItem("refresh_token", refreshToken);
  }
};

export const getToken = () => {
  return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
};

export const removeToken = () => {
  localStorage.removeItem('access_token'); 
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('google_access_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
};

export const getGoogleLoginStatus = () => {
  return !!localStorage.getItem("google_access_token");
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // Verifica se o token está expirado (opcional)
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};