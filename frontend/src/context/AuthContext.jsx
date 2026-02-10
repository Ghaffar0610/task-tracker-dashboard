import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "tt-token";
const TOKEN_SESSION_KEY = "tt-token-session";
const USER_KEY = "tt-user";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const parseJwt = (jwtToken) => {
    try {
      const [, payload] = jwtToken.split(".");
      if (!payload) return null;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const json = atob(normalized);
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  };

  const scheduleAutoLogout = (jwtToken) => {
    clearLogoutTimer();
    if (!jwtToken) return;
    const payload = parseJwt(jwtToken);
    if (!payload?.exp) return;
    const expiresAtMs = payload.exp * 1000;
    const delay = expiresAtMs - Date.now();
    if (delay <= 0) {
      logout();
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, delay);
  };

  useEffect(() => {
    const storedToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_SESSION_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    setToken(storedToken || "");
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setIsAuthenticated(Boolean(storedToken));
    setIsReady(true);
    if (storedToken) {
      scheduleAutoLogout(storedToken);
    }
  }, []);

  const login = ({ token: authToken, user: authUser, remember }) => {
    scheduleAutoLogout(authToken);
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
    clearLogoutTimer();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
    setToken("");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    if (localStorage.getItem(USER_KEY)) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }
  };

  const value = useMemo(
    () => ({ isAuthenticated, isReady, token, user, login, logout, updateUser }),
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
