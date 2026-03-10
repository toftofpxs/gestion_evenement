import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, getUser, removeToken, saveToken, saveUser } from '../storage/tokenStorage';
import { setOnTokenExpired } from '../api/axios';

const AuthContext = createContext();
const BYPASS_LOGIN = process.env.EXPO_PUBLIC_BYPASS_LOGIN === 'true';

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    await removeToken();
    setUserToken(null);
    setUserData(null);
  };

  const login = async (token, user) => {
    await saveToken(token);
    await saveUser(user);
    setUserToken(token);
    setUserData(user);
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        if (BYPASS_LOGIN) {
          setUserToken('bypass-token');
          setUserData({ name: 'Mode test', role: 'participant' });
          return;
        }

        const token = await getToken();
        const user = await getUser();
        if (token) {
          setUserToken(token);
          setUserData(user);
        }
      } catch (error) {
        console.error('Erreur vérification token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setOnTokenExpired(logout);
    checkToken();

    return () => setOnTokenExpired(null);
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, userData, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
