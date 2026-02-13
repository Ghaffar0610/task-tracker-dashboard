/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "tt-token";
const TOKEN_SESSION_KEY = "tt-token-session";
const USER_KEY = "tt-user";
const USER_SESSION_KEY = "tt-user-session";

export const AuthProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_SESSION_KEY) ||
      ""
    );
  });
  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_SESSION_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_SESSION_KEY);
    return Boolean(storedToken);
  });
  const logoutTimerRef = useRef(null);
  const hasHydratedRef = useRef(false);

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
    } catch {
      return null;
    }
  };

  function logout() {
    clearLogoutTimer();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
    sessionStorage.removeItem(USER_SESSION_KEY);
    setToken("");
    setUser(null);
    setIsAuthenticated(false);
  }

  function scheduleAutoLogout(jwtToken) {
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
  }

  useEffect(() => {
    // Hydrate from the API so profile/settings persist across devices and refreshes.
    // Local/session storage is only a cache; the DB is the source of truth.
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const storedToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_SESSION_KEY);

    if (!storedToken) {
      setIsReady(true);
      return;
    }

    setToken(storedToken);
    setIsAuthenticated(true);
    scheduleAutoLogout(storedToken);

    const controller = new AbortController();
    const hydrateUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            logout();
          }
          return;
        }

        setUser(data);

        // Persist to the same storage as the token.
        if (localStorage.getItem(TOKEN_KEY)) {
          localStorage.setItem(USER_KEY, JSON.stringify(data));
        } else {
          sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(data));
        }
      } catch {
        // If offline/failed, keep cached user if any.
      } finally {
        setIsReady(true);
      }
    };

    hydrateUser();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (token) {
      scheduleAutoLogout(token);
    } else {
      clearLogoutTimer();
    }
  }, [token]);

  const login = ({ token: authToken, user: authUser, remember }) => {
    scheduleAutoLogout(authToken);
    if (remember) {
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
      sessionStorage.removeItem(USER_SESSION_KEY);
    } else {
      sessionStorage.setItem(TOKEN_SESSION_KEY, authToken);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(authUser));
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setToken(authToken);
    setUser(authUser);
    setIsAuthenticated(true);
    setIsReady(true);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    if (localStorage.getItem(USER_KEY)) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else if (sessionStorage.getItem(USER_SESSION_KEY)) {
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(nextUser));
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
