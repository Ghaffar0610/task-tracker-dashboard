import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const FocusContext = createContext(null);

export const FocusProvider = ({ children }) => {
  const { token, isAuthenticated, isReady } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const endAtRef = useRef(0);
  const tasksCompletedRef = useRef(0);
  const sessionIdRef = useRef("");
  const timerRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isReady || !isAuthenticated || !token) {
      setIsActive(false);
      setRemainingSeconds(0);
      setDurationMinutes(0);
      setTasksCompleted(0);
      setSessionId("");
      tasksCompletedRef.current = 0;
      sessionIdRef.current = "";
      clearTimer();
      return;
    }
  }, [isAuthenticated, isReady, token]);

  const startFocus = async (minutes) => {
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/focus/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ durationMinutes: minutes }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to start focus.");
        return;
      }
      const endAt = Date.now() + minutes * 60 * 1000;
      endAtRef.current = endAt;
      setSessionId(data._id);
      sessionIdRef.current = data._id;
      setDurationMinutes(minutes);
      setTasksCompleted(0);
      tasksCompletedRef.current = 0;
      setIsActive(true);
      setRemainingSeconds(Math.ceil((endAt - Date.now()) / 1000));
    } catch (err) {
      setError("Unable to reach the server.");
    }
  };

  const stopFocus = async () => {
    if (!sessionIdRef.current) {
      setIsActive(false);
      setRemainingSeconds(0);
      clearTimer();
      return;
    }
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/focus/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          tasksCompleted: tasksCompletedRef.current,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to stop focus.");
        return;
      }
      setIsActive(false);
      setRemainingSeconds(0);
      setSessionId("");
      sessionIdRef.current = "";
      clearTimer();
      await refreshSummary();
    } catch (err) {
      setError("Unable to reach the server.");
    }
  };

  const incrementTaskCompleted = () => {
    if (!isActive) return;
    setTasksCompleted((prev) => prev + 1);
    tasksCompletedRef.current += 1;
  };

  const refreshSummary = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${apiBase}/api/focus/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to load focus summary.");
        return;
      }
      setSummary(data);
    } catch (err) {
      setError("Unable to reach the server.");
    }
  };

  useEffect(() => {
    if (!isActive) {
      clearTimer();
      return;
    }
    clearTimer();
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        stopFocus();
      }
    }, 1000);
    return () => clearTimer();
  }, [isActive]);

  useEffect(() => {
    if (token) {
      refreshSummary();
    }
  }, [token]);

  const value = useMemo(
    () => ({
      isActive,
      remainingSeconds,
      durationMinutes,
      tasksCompleted,
      summary,
      error,
      startFocus,
      stopFocus,
      incrementTaskCompleted,
      refreshSummary,
    }),
    [isActive, remainingSeconds, durationMinutes, tasksCompleted, summary, error]
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
};
