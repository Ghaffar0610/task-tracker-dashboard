import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useFocus } from "./FocusContext";
import { API_BASE_URL } from "../config/api";

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { token, isAuthenticated, isReady } = useAuth();
  const { incrementTaskCompleted } = useFocus();

  const apiBase = API_BASE_URL;

  useEffect(() => {
    const loadTasks = async () => {
      if (!isReady || !isAuthenticated || !token) {
        setTasks([]);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`${apiBase}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Failed to load tasks.");
          setTasks([]);
          return;
        }
        setTasks(data);
      } catch (err) {
        setError("Unable to reach the server.");
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [apiBase, isAuthenticated, isReady, token]);

  const addTask = async (title, description, status = "pending") => {
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, status }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to create task.");
        return null;
      }
      setTasks((prev) => [data, ...prev]);
      return data._id;
    } catch (err) {
      setError("Unable to reach the server.");
      return null;
    }
  };

  const deleteTask = async (id) => {
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to delete task.");
        return;
      }
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      setError("Unable to reach the server.");
    }
  };

  const toggleTaskStatus = async (id) => {
    const task = tasks.find((item) => item._id === id);
    if (!task) return;
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    await updateTask(id, { status: nextStatus });
  };

  const updateTask = async (id, updates) => {
    setError("");
    try {
      const currentTask = tasks.find((task) => task._id === id);
      const response = await fetch(`${apiBase}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to update task.");
        return;
      }
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? data : task))
      );
      if (
        updates.status === "completed" &&
        currentTask &&
        currentTask.status !== "completed"
      ) {
        incrementTaskCompleted();
      }
    } catch (err) {
      setError("Unable to reach the server.");
    }
  };

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status === "pending").length,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        isLoading,
        error,
        addTask,
        deleteTask,
        toggleTaskStatus,
        updateTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
