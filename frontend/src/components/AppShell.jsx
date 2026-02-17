import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";
import { applyTheme } from "../utils/theme";

const AppShell = () => {
  const { user, pendingAccountEvent, markAccountEventRead, logout } = useAuth();
  const requiresLogout = Boolean(pendingAccountEvent?.metadata?.requiresLogout);

  useEffect(() => {
    // Default to light so refresh doesn't unexpectedly switch to OS dark mode.
    applyTheme(user?.uiTheme || "light");
  }, [user?.uiTheme]);

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>

      {pendingAccountEvent ? (
        <div className="fixed inset-0 z-[1300] bg-black/50">
          <div className="flex h-full w-full items-end justify-center px-4 pb-4 pt-8 sm:items-center sm:pb-0">
            <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
              <div className="border-b border-gray-100 px-5 py-4 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Account Update Notice
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">
                  Action: {pendingAccountEvent.action}
                </p>
              </div>
              <div className="space-y-3 px-5 py-4">
                <p className="text-sm text-gray-700 dark:text-slate-200">
                  {pendingAccountEvent.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-300">
                  {new Date(pendingAccountEvent.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end dark:border-slate-800">
                {requiresLogout ? null : (
                  <button
                    type="button"
                    onClick={async () => {
                      await markAccountEventRead(pendingAccountEvent._id);
                    }}
                    className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Dismiss
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await markAccountEventRead(pendingAccountEvent._id);
                    if (requiresLogout) {
                      logout();
                    }
                  }}
                  className={[
                    "rounded-md px-4 py-2 text-sm font-semibold text-white",
                    requiresLogout ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700",
                  ].join(" ")}
                >
                  {requiresLogout ? "Logout" : "Acknowledge"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AppShell;
