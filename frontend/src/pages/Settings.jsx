import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import NotificationBell from "../components/NotificationBell";
import UserProfileButton from "../components/UserProfileButton";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "tt-settings";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Account & Security" },
  { id: "appearance", label: "Appearance" },
  { id: "workspace", label: "Workspace / Team" },
  { id: "calendar", label: "Calendar" },
  { id: "about", label: "About & Support" },
];

const inputClass =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

const getStoredSettings = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

const saveStoredSettings = (nextSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
};

const applyTheme = (theme) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);
  document.body.classList.toggle("theme-dark", shouldUseDark);
};

const Settings = () => {
  const { user, updateUser } = useAuth();
  const stored = getStoredSettings();

  const [activeSection, setActiveSection] = useState("profile");
  const [savingSection, setSavingSection] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || stored.profile?.name || "",
    avatarUrl: user?.avatarUrl || stored.profile?.avatarUrl || "",
    timezone: stored.profile?.timezone || "UTC",
    language: stored.profile?.language || "English",
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: Boolean(stored.security?.twoFactorEnabled),
  });

  const [appearanceForm, setAppearanceForm] = useState({
    theme: stored.appearance?.theme || "system",
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    teamName: stored.workspace?.teamName || "",
    inviteEmail: "",
    defaultRole: stored.workspace?.defaultRole || "member",
  });

  const [calendarForm, setCalendarForm] = useState({
    connected: Boolean(stored.calendar?.connected),
    syncTasks: Boolean(stored.calendar?.syncTasks),
  });

  useEffect(() => {
    applyTheme(appearanceForm.theme);
  }, [appearanceForm.theme]);

  const activeLabel = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label || "",
    [activeSection]
  );

  const runSave = async ({ section, payload, onSuccess }) => {
    setSavingSection(section);
    setFeedback({ type: "", message: "" });
    try {
      const nextSettings = {
        ...getStoredSettings(),
        [section]: payload,
      };
      saveStoredSettings(nextSettings);
      onSuccess?.();
      setFeedback({ type: "success", message: "Saved." });
    } catch {
      setFeedback({ type: "error", message: "Unable to save." });
    } finally {
      setSavingSection("");
    }
  };

  const handleProfileSave = (event) => {
    event.preventDefault();
    runSave({
      section: "profile",
      payload: profileForm,
      onSuccess: () => updateUser({ ...user, ...profileForm }),
    });
  };

  const handleSecuritySave = (event) => {
    event.preventDefault();
    if (!securityForm.newPassword || !securityForm.confirmPassword) {
      setFeedback({ type: "error", message: "Enter new password fields." });
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }
    runSave({
      section: "security",
      payload: { twoFactorEnabled: securityForm.twoFactorEnabled },
      onSuccess: () =>
        setSecurityForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })),
    });
  };

  const handleAppearanceSave = (event) => {
    event.preventDefault();
    runSave({
      section: "appearance",
      payload: appearanceForm,
      onSuccess: () => applyTheme(appearanceForm.theme),
    });
  };

  const handleWorkspaceSave = (event) => {
    event.preventDefault();
    runSave({
      section: "workspace",
      payload: workspaceForm,
      onSuccess: () =>
        setWorkspaceForm((prev) => ({
          ...prev,
          inviteEmail: "",
        })),
    });
  };

  const handleCalendarSave = (event) => {
    event.preventDefault();
    runSave({ section: "calendar", payload: calendarForm });
  };

  return (
    <Layout>
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

          {activeSection === "profile" ? (
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">Name</span>
                  <input
                    className={inputClass}
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Avatar URL
                  </span>
                  <input
                    className={inputClass}
                    value={profileForm.avatarUrl}
                    onChange={(event) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        avatarUrl: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Timezone
                  </span>
                  <select
                    className={inputClass}
                    value={profileForm.timezone}
                    onChange={(event) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        timezone: event.target.value,
                      }))
                    }
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Chicago">America/Chicago</option>
                    <option value="America/Denver">America/Denver</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Language
                  </span>
                  <select
                    className={inputClass}
                    value={profileForm.language}
                    onChange={(event) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        language: event.target.value,
                      }))
                    }
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </label>
              </div>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={savingSection === "profile"}
              >
                {savingSection === "profile" ? "Saving..." : "Save Profile"}
              </button>
            </form>
          ) : null}

          {activeSection === "security" ? (
            <form className="space-y-4" onSubmit={handleSecuritySave}>
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
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={securityForm.twoFactorEnabled}
                  onChange={(event) =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      twoFactorEnabled: event.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700">Enable 2FA</span>
              </label>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={savingSection === "security"}
              >
                {savingSection === "security" ? "Saving..." : "Save Security"}
              </button>
            </form>
          ) : null}

          {activeSection === "appearance" ? (
            <form className="space-y-4" onSubmit={handleAppearanceSave}>
              <label className="space-y-2 block max-w-sm">
                <span className="text-sm font-semibold text-gray-600">Theme</span>
                <select
                  className={inputClass}
                  value={appearanceForm.theme}
                  onChange={(event) =>
                    setAppearanceForm((prev) => ({
                      ...prev,
                      theme: event.target.value,
                    }))
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
                    value={workspaceForm.teamName}
                    onChange={(event) =>
                      setWorkspaceForm((prev) => ({
                        ...prev,
                        teamName: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Invite by email
                  </span>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="teammate@example.com"
                    value={workspaceForm.inviteEmail}
                    onChange={(event) =>
                      setWorkspaceForm((prev) => ({
                        ...prev,
                        inviteEmail: event.target.value,
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

          {activeSection === "calendar" ? (
            <form className="space-y-4" onSubmit={handleCalendarSave}>
              <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">
                  Google Calendar
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Single calendar integration for task sync.
                </p>
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={calendarForm.connected}
                  onChange={(event) =>
                    setCalendarForm((prev) => ({
                      ...prev,
                      connected: event.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700">Connected</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={calendarForm.syncTasks}
                  onChange={(event) =>
                    setCalendarForm((prev) => ({
                      ...prev,
                      syncTasks: event.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700">
                  Sync task due dates
                </span>
              </label>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={savingSection === "calendar"}
              >
                {savingSection === "calendar"
                  ? "Saving..."
                  : "Save Calendar Settings"}
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
                  For support, use:
                  {" "}
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
    </Layout>
  );
};

export default Settings;
