import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";
import { applyTheme } from "../utils/theme";

const AppShell = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Default to light so refresh doesn't unexpectedly switch to OS dark mode.
    applyTheme(user?.uiTheme || "light");
  }, [user?.uiTheme]);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default AppShell;
