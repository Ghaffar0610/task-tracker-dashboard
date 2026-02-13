import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";
import { applyTheme } from "../utils/theme";

const AppShell = () => {
  const { user } = useAuth();

  useEffect(() => {
    applyTheme(user?.uiTheme || "system");
  }, [user?.uiTheme]);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default AppShell;

