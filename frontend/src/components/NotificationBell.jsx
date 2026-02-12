import { useEffect, useMemo, useRef, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const absMinutes = Math.abs(diffMinutes);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMinutes < 60) return rtf.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
};

const NotificationBell = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const panelRef = useRef(null);

  const hasUnread = unreadCount > 0;

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [items]);

  const loadNotifications = async () => {
    if (!token || !isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to load notifications.");
        return;
      }
      setItems(data.items || []);
      setUnreadCount(Number(data.unreadCount) || 0);
    } catch (_err) {
      setError("Unable to reach the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!token || !isAuthenticated) return;
    setLoadingPrefs(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/me/notification-preferences`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) return;
      setEmailEnabled(Boolean(data.emailNotificationsEnabled));
    } catch (_err) {
      // Keep notification panel usable even if preferences request fails.
    } finally {
      setLoadingPrefs(false);
    }
  };

  const updateEmailPreference = async (nextValue) => {
    if (!token) return;
    setSavingPrefs(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/me/notification-preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            emailNotificationsEnabled: nextValue,
            emailNotificationTypes: [
              "task_created",
              "task_updated",
              "task_completed",
              "task_deleted",
            ],
          }),
        }
      );
      if (!response.ok) return;
      setEmailEnabled(nextValue);
    } catch (_err) {
      // Keep panel responsive even when save fails.
    } finally {
      setSavingPrefs(false);
    }
  };

  const markRead = async (id) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_err) {
      // Keep UI responsive even if a single mark-read request fails.
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (_err) {
      // Keep UI responsive even if request fails.
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    loadNotifications();
    loadPreferences();
  }, [isAuthenticated, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={async () => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) await loadNotifications();
        }}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700"
        aria-label="Open notifications"
      >
        <BellIcon className="h-5 w-5" />
        {hasUnread ? (
          <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(90vw,24rem)] rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#1e293b]">Notifications</p>
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              disabled={!hasUnread}
            >
              Mark all read
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#1e293b]">
                Email notifications
              </p>
              <p className="text-xs text-gray-500">
                Get task alerts by email
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateEmailPreference(!emailEnabled)}
              disabled={loadingPrefs || savingPrefs}
              className={[
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                emailEnabled ? "bg-blue-600" : "bg-gray-300",
                loadingPrefs || savingPrefs ? "opacity-60" : "",
              ].join(" ")}
              aria-label="Toggle email notifications"
            >
              <span
                className={[
                  "inline-block h-5 w-5 transform rounded-full bg-white transition",
                  emailEnabled ? "translate-x-5" : "translate-x-0.5",
                ].join(" ")}
              />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500">Loading notifications...</div>
            ) : error ? (
              <div className="p-3 text-sm text-red-500">{error}</div>
            ) : sortedItems.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No notifications yet.</div>
            ) : (
              sortedItems.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={async () => {
                    if (!item.isRead) await markRead(item._id);
                    setIsOpen(false);
                    navigate("/tasks");
                  }}
                  className={[
                    "mb-1 w-full rounded-lg px-3 py-3 text-left",
                    item.isRead ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[#1e293b]">{item.title}</p>
                    {!item.isRead ? (
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-500" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{item.message}</p>
                  <p className="mt-2 text-[11px] text-gray-400">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;
