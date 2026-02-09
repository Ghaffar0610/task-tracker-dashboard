import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "tt-token";
const TOKEN_SESSION_KEY = "tt-token-session";
const USER_KEY = "tt-user";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_SESSION_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    setToken(storedToken || "");
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setIsAuthenticated(Boolean(storedToken));
    setIsReady(true);
  }, []);

  const login = ({ token: authToken, user: authUser, remember }) => {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
    } else {
      sessionStorage.setItem(TOKEN_SESSION_KEY, authToken);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setToken(authToken);
    setUser(authUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
    setToken("");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({ isAuthenticated, isReady, token, user, login, logout }),
    [isAuthenticated, isReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
