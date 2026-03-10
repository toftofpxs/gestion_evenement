import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, getUser, removeToken, saveToken, saveUser } from '../storage/tokenStorage';
import { setOnTokenExpired } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await removeToken();
    setUserToken(null);
    setUserData(null);
  }, []);

  const login = useCallback(async (token, user) => {
    await saveToken(token);
    await saveUser(user);
    setUserToken(token);
    setUserData(user);
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();
        const user = await getUser();

        if (token) {
          setUserToken(token);
          setUserData(user);
        }
      } finally {
        setIsLoading(false);
      }
    };

    setOnTokenExpired(logout);
    checkToken();

    return () => {
      setOnTokenExpired(null);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      userToken,
      userData,
      isLoading,
      login,
      logout,
    }),
    [userToken, userData, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
