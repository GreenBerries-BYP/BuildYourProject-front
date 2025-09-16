export const saveToken = (token, keepLogged = false, refreshToken = null) => {
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

export const removeToken = () => {
  localStorage.removeItem('access_token'); // Remove o token do localStorage
    //Isso é útil para fazer logout do usuário
};

export const getGoogleLoginStatus = () => {
  return !!localStorage.getItem("google_access_token");
};

