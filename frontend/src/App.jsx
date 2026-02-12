import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import Offline from "./pages/Offline";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider } from "./context/AuthContext";
import { FocusProvider } from "./context/FocusContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <FocusProvider>
        <TaskProvider>
        <BrowserRouter>
          {isOnline ? (
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                }
              />
              <Route path="/offline" element={<Offline />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          ) : (
            <Offline />
          )}
        </BrowserRouter>
        </TaskProvider>
      </FocusProvider>
    </AuthProvider>
  );
}

export default App;
