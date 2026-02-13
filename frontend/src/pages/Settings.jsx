import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import NotificationBell from "../components/NotificationBell";
import UserProfileButton from "../components/UserProfileButton";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import { applyTheme } from "../utils/theme";

const sections = [
  { id: "security", label: "Account & Security" },
  { id: "appearance", label: "Appearance" },
  { id: "workspace", label: "Workspace / Team" },
  { id: "about", label: "About & Support" },
];

const inputClass =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

const Settings = () => {
  const { token, user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("security");
  const [savingSection, setSavingSection] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [appearanceForm, setAppearanceForm] = useState({
    theme: user?.uiTheme || "system",
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    workspaceName: user?.workspaceName || "",
    defaultRole: user?.workspaceDefaultRole || "member",
  });

  const activeLabel = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label || "",
    [activeSection]
  );

  const authedFetchJson = async (url, { method, body }) => {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }
    return data;
  };

  const runSave = async ({ section, action }) => {
    setSavingSection(section);
    setFeedback({ type: "", message: "" });
    try {
      await action();
      setFeedback({ type: "success", message: "Saved." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to save.",
      });
    } finally {
      setSavingSection("");
    }
  };

  const handlePasswordSave = (event) => {
    event.preventDefault();
    if (!securityForm.currentPassword || !securityForm.newPassword) {
      setFeedback({
        type: "error",
        message: "Current password and new password are required.",
      });
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }

    runSave({
      section: "security",
      action: async () => {
        await authedFetchJson(`${API_BASE_URL}/api/users/me/password`, {
          method: "PUT",
          body: {
            currentPassword: securityForm.currentPassword,
            newPassword: securityForm.newPassword,
          },
        });
        setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      },
    });
  };

  const handleThemeSave = (event) => {
    event.preventDefault();
    runSave({
      section: "appearance",
      action: async () => {
        const updated = await authedFetchJson(`${API_BASE_URL}/api/users/me`, {
          method: "PATCH",
          body: { uiTheme: appearanceForm.theme },
        });
        updateUser(updated);
        applyTheme(updated.uiTheme || "system");
      },
    });
  };

  const handleWorkspaceSave = (event) => {
    event.preventDefault();
    runSave({
      section: "workspace",
      action: async () => {
        const updated = await authedFetchJson(`${API_BASE_URL}/api/users/me`, {
          method: "PATCH",
          body: {
            workspaceName: workspaceForm.workspaceName,
            workspaceDefaultRole: workspaceForm.defaultRole,
          },
        });
        updateUser(updated);
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Settings"
        right={
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <NotificationBell />
            <UserProfileButton />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSection(section.id);
                  setFeedback({ type: "", message: "" });
                }}
                className={[
                  "min-h-11 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors",
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-[#1e293b]">{activeLabel}</h2>
          </div>

          {feedback.message ? (
            <div
              className={[
                "mb-4 rounded-md border p-3 text-sm",
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-600",
              ].join(" ")}
            >
              {feedback.message}
            </div>
          ) : null}

          {activeSection === "security" ? (
            <form className="space-y-4" onSubmit={handlePasswordSave}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Current Password
                  </span>
                  <input
                    type="password"
                    className={inputClass}
                    value={securityForm.currentPassword}
                    onChange={(event) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    New Password
                  </span>
                  <input
                    type="password"
                    className={inputClass}
                    value={securityForm.newPassword}
                    onChange={(event) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Confirm Password
                  </span>
                  <input
                    type="password"
                    className={inputClass}
                    value={securityForm.confirmPassword}
                    onChange={(event) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={savingSection === "security"}
              >
                {savingSection === "security" ? "Saving..." : "Change Password"}
              </button>
            </form>
          ) : null}

          {activeSection === "appearance" ? (
            <form className="space-y-4" onSubmit={handleThemeSave}>
              <label className="space-y-2 block max-w-sm">
                <span className="text-sm font-semibold text-gray-600">Theme</span>
                <select
                  className={inputClass}
                  value={appearanceForm.theme}
                  onChange={(event) =>
                    setAppearanceForm({ theme: event.target.value })
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={savingSection === "appearance"}
              >
                {savingSection === "appearance" ? "Saving..." : "Save Theme"}
              </button>
            </form>
          ) : null}

          {activeSection === "workspace" ? (
            <form className="space-y-4" onSubmit={handleWorkspaceSave}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Workspace Name
                  </span>
                  <input
                    className={inputClass}
                    value={workspaceForm.workspaceName}
                    onChange={(event) =>
                      setWorkspaceForm((prev) => ({
                        ...prev,
                        workspaceName: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Default role
                  </span>
                  <select
                    className={inputClass}
                    value={workspaceForm.defaultRole}
                    onChange={(event) =>
                      setWorkspaceForm((prev) => ({
                        ...prev,
                        defaultRole: event.target.value,
                      }))
                    }
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </label>
              </div>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={savingSection === "workspace"}
              >
                {savingSection === "workspace" ? "Saving..." : "Save Workspace"}
              </button>
            </form>
          ) : null}

          {activeSection === "about" ? (
            <div className="space-y-4">
              <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Task Tracker Dashboard</p>
                <p className="mt-1 text-lg font-semibold text-[#1e293b]">v1.0.0</p>
              </div>
              <div className="rounded-md border border-gray-100 p-4">
                <p className="text-sm text-gray-600">
                  Support:{" "}
                  <a
                    href="mailto:support@tasktracker.app"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    support@tasktracker.app
                  </a>
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
};

export default Settings;
