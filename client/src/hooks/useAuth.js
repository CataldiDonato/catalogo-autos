import { useState, useEffect } from "react";
import { getUser, getToken, clearAuth } from "../utils/formatters";

/**
 * Hook custom para gestionar autenticación
 */
export const useAuth = () => {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
};
