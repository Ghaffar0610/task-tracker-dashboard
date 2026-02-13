import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import NotificationBell from "../components/NotificationBell";
import UserProfileButton from "../components/UserProfileButton";
import CalendarQuickView from "../components/CalendarQuickView";
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

  const [referrals, setReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState("");

  const activeLabel = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label || "",
    [activeSection]
  );

  useEffect(() => {
    if (activeSection !== "workspace" || !token) return;

    const load = async () => {
      setReferralsLoading(true);
      setReferralsError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me/referrals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setReferralsError(data.message || "Unable to load team members.");
          setReferralsLoading(false);
          return;
        }
        setReferrals(Array.isArray(data) ? data : []);
      } catch {
        setReferralsError("Unable to reach the server.");
      } finally {
        setReferralsLoading(false);
      }
    };

    load();
  }, [activeSection, token]);

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
            <CalendarQuickView />
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
                  <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">
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
                  <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">
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

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-100">
                  Invite via referral
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                  Share your link. When someone signs up with it, you earn points.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-gray-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      Your Points
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-800 dark:text-slate-100">
                      {user?.referralPoints ?? 0}
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      Members Referred
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-800 dark:text-slate-100">
                      {user?.referralsCount ?? 0}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
                  <input
                    readOnly
                    className={inputClass}
                    value={
                      user?.referralCode
                        ? `${window.location.origin}/register?ref=${user.referralCode}`
                        : "Referral code not ready yet."
                    }
                  />
                  <button
                    type="button"
                    className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                    disabled={!user?.referralCode}
                    onClick={async () => {
                      if (!user?.referralCode) return;
                      await navigator.clipboard.writeText(
                        `${window.location.origin}/register?ref=${user.referralCode}`
                      );
                      setFeedback({ type: "success", message: "Invite link copied." });
                    }}
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-100">
                  Team Members (Referred)
                </p>
                {referralsError ? (
                  <p className="mt-2 text-sm text-red-600">{referralsError}</p>
                ) : referralsLoading ? (
                  <p className="mt-2 text-sm text-gray-500 dark:text-slate-300">
                    Loading members...
                  </p>
                ) : referrals.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500 dark:text-slate-300">
                    No members yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {referrals.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40"
                      >
                        <span className="font-semibold text-gray-700 dark:text-slate-100">
                          {member.name || "Unnamed"}
                        </span>
                        <span className="text-gray-500 dark:text-slate-300">
                          {member.email}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
