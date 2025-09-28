import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, removeToken } from './auth';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = () => {
      const token = getToken();
      if (token) {
        try {
          const decodedUser = jwtDecode(token);
          setUser(decodedUser);
        } catch (error) {
          console.error("Token inválido, removendo:", error);
          removeToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const logout = () => {
    removeToken();
    setUser(null);
  };
  
  const loginUser = (token) => {
    try {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    } catch (error) {
      console.error("Erro ao decodificar token no login:", error);
      setUser(null);
    }
  };

  const value = {
    user,
    setUser: loginUser,
    isLoggedIn: !!user,
    loading,
    logout,
  };

  if (loading) {
    return true; 
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};