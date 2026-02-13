import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import NotificationBell from "../components/NotificationBell";
import UserProfileButton from "../components/UserProfileButton";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Account & Security" },
  { id: "appearance", label: "Appearance" },
  { id: "workspace", label: "Workspace / Team" },
  { id: "calendar", label: "Calendar Integration" },
  { id: "about", label: "About & Support" },
];

const inputClass =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

const Settings = () => {
  const { token, user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [savingSection, setSavingSection] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    avatarUrl: user?.avatarUrl || "",
    timezone: user?.timezone || "UTC",
    language: user?.language || "English",
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: Boolean(user?.twoFactorEnabled),
    revokeOtherSessions: false,
  });

  const [appearanceForm, setAppearanceForm] = useState({
    theme: "system",
    density: "cozy",
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    teamName: user?.teamName || "",
    inviteEmail: "",
    defaultRole: "member",
    allowMemberInvites: false,
  });

  const [calendarForm, setCalendarForm] = useState({
    provider: "google",
    syncMode: "read_write",
    defaultCalendar: "primary",
    connected: false,
  });

  const activeLabel = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label || "",
    [activeSection]
  );

  const patchSettings = async (section, payload) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/${section}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to save changes.");
    }

    return data;
  };

  const runSave = async ({ section, payload, onSuccess }) => {
    setSavingSection(section);
    setFeedback({ type: "", message: "" });
    try {
      await patchSettings(section, payload);
      onSuccess?.();
      setFeedback({ type: "success", message: "Changes saved." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to save changes.",
      });
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
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }

    runSave({
      section: "security",
      payload: securityForm,
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
    runSave({ section: "appearance", payload: appearanceForm });
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

  const handleConnectCalendar = () => {
    runSave({
      section: "calendar/connect",
      payload: { provider: calendarForm.provider },
      onSuccess: () => {
        setCalendarForm((prev) => ({ ...prev, connected: true }));
      },
    });
  };

  const handleDisconnectCalendar = () => {
    runSave({
      section: "calendar/disconnect",
      payload: { provider: calendarForm.provider },
      onSuccess: () => {
        setCalendarForm((prev) => ({ ...prev, connected: false }));
      },
    });
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
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={securityForm.revokeOtherSessions}
                  onChange={(event) =>
                    setSecurityForm((prev) => ({
                      ...prev,
                      revokeOtherSessions: event.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700">
                  Sign out from other sessions after save
                </span>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
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
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Density
                  </span>
                  <select
                    className={inputClass}
                    value={appearanceForm.density}
                    onChange={(event) =>
                      setAppearanceForm((prev) => ({
                        ...prev,
                        density: event.target.value,
                      }))
                    }
                  >
                    <option value="compact">Compact</option>
                    <option value="cozy">Cozy</option>
                  </select>
                </label>
              </div>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={savingSection === "appearance"}
              >
                {savingSection === "appearance"
                  ? "Saving..."
                  : "Save Appearance"}
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
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={workspaceForm.allowMemberInvites}
                  onChange={(event) =>
                    setWorkspaceForm((prev) => ({
                      ...prev,
                      allowMemberInvites: event.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700">
                  Allow members to invite others
                </span>
              </label>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Provider
                  </span>
                  <select
                    className={inputClass}
                    value={calendarForm.provider}
                    onChange={(event) =>
                      setCalendarForm((prev) => ({
                        ...prev,
                        provider: event.target.value,
                      }))
                    }
                  >
                    <option value="google">Google Calendar</option>
                    <option value="outlook">Outlook Calendar</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Sync mode
                  </span>
                  <select
                    className={inputClass}
                    value={calendarForm.syncMode}
                    onChange={(event) =>
                      setCalendarForm((prev) => ({
                        ...prev,
                        syncMode: event.target.value,
                      }))
                    }
                  >
                    <option value="read_write">Two-way sync</option>
                    <option value="read_only">Read only</option>
                  </select>
                </label>
              </div>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-gray-600">
                  Default calendar
                </span>
                <input
                  className={inputClass}
                  value={calendarForm.defaultCalendar}
                  onChange={(event) =>
                    setCalendarForm((prev) => ({
                      ...prev,
                      defaultCalendar: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="flex flex-wrap gap-3">
                {calendarForm.connected ? (
                  <button
                    type="button"
                    onClick={handleDisconnectCalendar}
                    className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    disabled={savingSection === "calendar/disconnect"}
                  >
                    {savingSection === "calendar/disconnect"
                      ? "Disconnecting..."
                      : "Disconnect"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectCalendar}
                    className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    disabled={savingSection === "calendar/connect"}
                  >
                    {savingSection === "calendar/connect"
                      ? "Connecting..."
                      : "Connect Calendar"}
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  disabled={savingSection === "calendar"}
                >
                  {savingSection === "calendar"
                    ? "Saving..."
                    : "Save Calendar Settings"}
                </button>
              </div>
            </form>
          ) : null}

          {activeSection === "about" ? (
            <div className="space-y-4">
              <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Current Version</p>
                <p className="mt-1 text-lg font-semibold text-[#1e293b]">v1.0.0</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/changelog"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  View Changelog
                </a>
                <a
                  href="mailto:support@tasktracker.app"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:bugs@tasktracker.app"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Report an Issue
                </a>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </Layout>
  );
};

export default Settings;
