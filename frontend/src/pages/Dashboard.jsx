import {
  Bars3Icon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import UserProfileButton from "../components/UserProfileButton";
import NotificationBell from "../components/NotificationBell";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useFocus } from "../context/FocusContext";
import { API_BASE_URL } from "../config/api";

const Dashboard = () => {
  const { stats, isLoading } = useTasks();
  const { token } = useAuth();
  const {
    isActive,
    remainingSeconds,
    durationMinutes,
    tasksCompleted,
    summary,
    error: focusError,
    startFocus,
    stopFocus,
  } = useFocus();
  const [activities, setActivities] = useState([]);
  const [activityAction, setActivityAction] = useState("all");
  const [activityQuery, setActivityQuery] = useState("");
  const [activityRange, setActivityRange] = useState("7");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [activityLoading, setActivityLoading] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const navigate = useNavigate();

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchActivities = async () => {
      setActivityLoading(true);
      setActivityError("");
      try {
        const params = new URLSearchParams();
        if (activityAction !== "all") params.set("action", activityAction);
        if (activityQuery.trim()) params.set("q", activityQuery.trim());
        if (activityRange !== "all") {
          const days = Number(activityRange);
          const to = new Date();
          const from = new Date();
          from.setDate(from.getDate() - days);
          params.set("from", from.toISOString());
          params.set("to", to.toISOString());
        }
        const response = await fetch(
          `${API_BASE_URL}/api/activities?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          setActivityError(data.message || "Unable to load activities.");
          setActivityLoading(false);
          return;
        }
        setActivities(data);
      } catch (err) {
        setActivityError("Unable to reach the server.");
      } finally {
        setActivityLoading(false);
      }
    };

    if (token) {
      fetchActivities();
    }
  }, [token, activityAction, activityQuery, activityRange]);

  const handleDeleteRequest = (activityId) => {
    setDeleteTarget(activityId);
    setDeletePassword("");
    setDeleteError("");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (!deletePassword) {
      setDeleteError("Password is required.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/activities/${deleteTarget}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: deletePassword }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setDeleteError(data.message || "Unable to delete activity.");
        setDeleteLoading(false);
        return;
      }
      setActivities((prev) => prev.filter((item) => item._id !== deleteTarget));
      setDeleteTarget(null);
      setDeletePassword("");
    } catch (err) {
      setDeleteError("Unable to reach the server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Welcome Back!"
        right={
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <NotificationBell />
            <UserProfileButton />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Tasks"
          value={stats.total}
          icon={<Bars3Icon className="h-5 w-5" />}
          iconClassName="bg-[#2563eb]"
          onIconClick={() => navigate("/tasks")}
        />
        <StatCard
          label="Completed Tasks"
          value={stats.completed}
          icon={<CheckIcon className="h-5 w-5" />}
          iconClassName="bg-[#34a853] font-bold"
          onIconClick={() => navigate("/tasks?status=completed")}
        />
        <StatCard
          label="Pending Tasks"
          value={stats.pending}
          icon={<Bars3Icon className="h-5 w-5" />}
          iconClassName="bg-[#e65f41]"
          onIconClick={() => navigate("/tasks?status=pending")}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg text-[#1e293b]">Focus Mode</h3>
        </div>
        <div className="p-5 space-y-4">
          {focusError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {focusError}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <div className="text-3xl font-bold text-[#1e293b]">
              {isActive ? formatTime(remainingSeconds) : "00:00"}
            </div>
            <div className="text-sm text-gray-500">
              {isActive ? `Session: ${durationMinutes} min` : "Not active"}
            </div>
            <div className="text-sm text-gray-500">
              Tasks completed: {tasksCompleted}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={5}
              max={180}
              value={focusMinutes}
              onChange={(event) => setFocusMinutes(Number(event.target.value))}
              className="w-24 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-28"
            />
            <button
              type="button"
              onClick={() => startFocus(25)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={isActive}
            >
              Start 25
            </button>
            <button
              type="button"
              onClick={() => startFocus(50)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={isActive}
            >
              Start 50
            </button>
            <button
              type="button"
              onClick={() => startFocus(focusMinutes)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              disabled={isActive}
            >
              Start Focus
            </button>
            <button
              type="button"
              onClick={stopFocus}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              disabled={!isActive}
            >
              Stop
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400">Streak</p>
              <p className="mt-2 text-2xl font-bold text-[#1e293b]">
                {summary?.streak ?? 0} days
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400">
                Focus Score (7d)
              </p>
              <p className="mt-2 text-2xl font-bold text-[#1e293b]">
                {summary?.focusScore ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400">
                Tasks Completed (7d)
              </p>
              <p className="mt-2 text-2xl font-bold text-[#1e293b]">
                {summary?.totalTasks ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg text-[#1e293b]">Recent Activities</h3>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={activityAction}
              onChange={(event) => setActivityAction(event.target.value)}
              className="min-h-11 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Types</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="completed">Completed</option>
              <option value="deleted">Deleted</option>
            </select>
            <select
              value={activityRange}
              onChange={(event) => setActivityRange(event.target.value)}
              className="min-h-11 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Time</option>
              <option value="1">Today</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <input
              type="text"
              value={activityQuery}
              onChange={(event) => setActivityQuery(event.target.value)}
              placeholder="Search activity..."
              className="min-h-11 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {activityError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {activityError}
            </div>
          ) : null}

          {activityLoading ? (
            <div className="text-sm text-gray-500">
              Loading recent activity...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-sm text-gray-500">No recent activity yet.</div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity._id}
                className="flex flex-wrap items-start gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 sm:flex-nowrap sm:items-center sm:gap-4"
              >
                <div
                  className={`h-4 w-4 rounded-sm ${
                    activity.action === "completed"
                      ? "bg-green-600"
                      : "bg-blue-500"
                  }`}
                ></div>
                <div className="min-w-0 flex flex-1 flex-col">
                  <p className="text-gray-700 text-sm">
                    {activity.message}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(activity._id)}
                  className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="flex h-full w-full items-end justify-center px-4 pb-4 pt-8 sm:items-center sm:pb-0">
            <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
                <h2 className="text-lg font-semibold text-[#1e293b]">
                  Confirm Deletion
                </h2>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="text-xl text-gray-400 hover:text-gray-600"
                >
                  x
                </button>
              </div>
              <div className="space-y-4 px-4 py-5 sm:px-6">
                <p className="text-sm text-gray-600">
                  Enter your password to delete this activity.
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {deleteError ? (
                  <p className="text-sm text-red-500">{deleteError}</p>
                ) : null}
                <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default Dashboard;



