import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import NotificationBell from "../components/NotificationBell";
import CalendarQuickView from "../components/CalendarQuickView";
import UserProfileButton from "../components/UserProfileButton";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const Admin = () => {
  const { token, user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [usersData, setUsersData] = useState({ items: [], pagination: null });
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState("");
  const [actionError, setActionError] = useState("");

  const isAdmin = user?.role === "admin";

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const authedFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }
    return data;
  };

  const loadOverview = async () => {
    if (!token || !isAdmin) return;
    const data = await authedFetch(`${API_BASE_URL}/api/admin/overview`);
    setOverview(data);
  };

  const loadUsers = async (page = userPage) => {
    if (!token || !isAdmin) return;
    setUsersLoading(true);
    setUsersError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search.trim()) params.set("q", search.trim());
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const data = await authedFetch(`${API_BASE_URL}/api/admin/users?${params}`);
      setUsersData(data);
      setUserPage(page);
    } catch (error) {
      setUsersError(error.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadLoginEvents = async () => {
    if (!token || !isAdmin) return;
    setEventsLoading(true);
    try {
      const data = await authedFetch(
        `${API_BASE_URL}/api/admin/login-events?limit=10&page=1`
      );
      setEvents(data.items || []);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    if (!token || !isAdmin) return;
    setLogsLoading(true);
    try {
      const data = await authedFetch(
        `${API_BASE_URL}/api/admin/audit-logs?limit=10&page=1`
      );
      setAuditLogs(data.items || []);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadUserDetail = async (userId) => {
    setActivityLoading(true);
    setActionError("");
    try {
      const [detail, activities] = await Promise.all([
        authedFetch(`${API_BASE_URL}/api/admin/users/${userId}`),
        authedFetch(`${API_BASE_URL}/api/admin/users/${userId}/activities?limit=8&page=1`),
      ]);
      setSelectedUser(detail);
      setSelectedActivities(activities.items || []);
    } catch (error) {
      setActionError(error.message || "Unable to load user detail.");
    } finally {
      setActivityLoading(false);
    }
  };

  const runUserAction = async (request) => {
    setActionFeedback("");
    setActionError("");
    try {
      const data = await request();
      setActionFeedback(data.message || "Action completed.");
      await Promise.all([loadOverview(), loadUsers(userPage), loadLoginEvents(), loadAuditLogs()]);
      if (selectedUser?.id) {
        await loadUserDetail(selectedUser.id);
      }
    } catch (error) {
      setActionError(error.message || "Action failed.");
    }
  };

  useEffect(() => {
    if (!isAdmin || !token) return;
    loadOverview();
    loadUsers(1);
    loadLoginEvents();
    loadAuditLogs();
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Admin access required.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Admin Panel"
        right={
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <NotificationBell />
            <CalendarQuickView />
            <UserProfileButton />
          </div>
        }
      />

      {actionFeedback ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {actionFeedback}
        </div>
      ) : null}
      {actionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Users</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {overview?.users?.total ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Active</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {overview?.users?.active ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Failed Logins (24h)</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {overview?.logins?.failed24h ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Tasks</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {overview?.usage?.tasks ?? 0}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name/email"
            className="min-h-11 min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="min-h-11 rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-11 rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>
          <button
            type="button"
            onClick={() => loadUsers(1)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </div>

        {usersError ? (
          <p className="text-sm text-red-600">{usersError}</p>
        ) : usersLoading ? (
          <p className="text-sm text-gray-500">Loading users...</p>
        ) : (
          <div className="space-y-2">
            {usersData.items.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.name || "Unnamed"} ({item.role})
                    </p>
                    <p className="text-gray-600">{item.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadUserDetail(item.id)}
                      className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runUserAction(() =>
                          authedFetch(`${API_BASE_URL}/api/admin/users/${item.id}/lock`, {
                            method: "PATCH",
                            headers: authHeaders,
                            body: JSON.stringify({ minutes: 60 }),
                          })
                        )
                      }
                      className="rounded-md border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700"
                    >
                      Lock
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runUserAction(() =>
                          authedFetch(`${API_BASE_URL}/api/admin/users/${item.id}/unlock`, {
                            method: "PATCH",
                            headers: authHeaders,
                          })
                        )
                      }
                      className="rounded-md border border-green-200 px-3 py-2 text-xs font-semibold text-green-700"
                    >
                      Unlock
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runUserAction(() =>
                          authedFetch(`${API_BASE_URL}/api/admin/users/${item.id}/status`, {
                            method: "PATCH",
                            headers: authHeaders,
                            body: JSON.stringify({ isActive: !item.isActive }),
                          })
                        )
                      }
                      className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runUserAction(async () => {
                          const data = await authedFetch(
                            `${API_BASE_URL}/api/admin/users/${item.id}/reset-password`,
                            {
                              method: "POST",
                              headers: authHeaders,
                            }
                          );
                          window.alert(`Temporary password: ${data.temporaryPassword}`);
                          return data;
                        })
                      }
                      className="rounded-md border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700"
                    >
                      Reset Pass
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runUserAction(() =>
                          authedFetch(`${API_BASE_URL}/api/admin/users/${item.id}/force-logout`, {
                            method: "POST",
                            headers: authHeaders,
                          })
                        )
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700"
                    >
                      Force Logout
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runUserAction(() =>
                          authedFetch(`${API_BASE_URL}/api/admin/users/${item.id}/role`, {
                            method: "PATCH",
                            headers: authHeaders,
                            body: JSON.stringify({
                              role: item.role === "admin" ? "member" : "admin",
                            }),
                          })
                        )
                      }
                      className="rounded-md border border-purple-200 px-3 py-2 text-xs font-semibold text-purple-700"
                    >
                      Make {item.role === "admin" ? "Member" : "Admin"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Page {usersData.pagination?.page || 1} /{" "}
            {usersData.pagination?.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!usersData.pagination || usersData.pagination.page <= 1}
              onClick={() => loadUsers((usersData.pagination?.page || 1) - 1)}
              className="rounded-md border border-gray-200 px-3 py-1 text-xs disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={
                !usersData.pagination ||
                usersData.pagination.page >= usersData.pagination.totalPages
              }
              onClick={() => loadUsers((usersData.pagination?.page || 1) + 1)}
              className="rounded-md border border-gray-200 px-3 py-1 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Recent Login Events</h3>
          {eventsLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="mt-2 space-y-2 text-sm">
              {events.map((event) => (
                <div key={event._id} className="rounded-md border border-gray-100 bg-gray-50 p-2">
                  <p className="font-semibold text-slate-800">
                    {event.email} - {event.success ? "Success" : "Failed"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {event.ip || "No IP"} | {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Admin Audit Logs</h3>
          {logsLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="mt-2 space-y-2 text-sm">
              {auditLogs.map((log) => (
                <div key={log._id} className="rounded-md border border-gray-100 bg-gray-50 p-2">
                  <p className="font-semibold text-slate-800">{log.action}</p>
                  <p className="text-xs text-gray-600">
                    Admin: {log.adminId?.email || "unknown"} | Target:{" "}
                    {log.targetUserId?.email || "n/a"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Selected User</h3>
        {activityLoading ? (
          <p className="mt-2 text-sm text-gray-500">Loading details...</p>
        ) : selectedUser ? (
          <div className="mt-2 space-y-3 text-sm">
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="font-semibold text-slate-800">{selectedUser.name}</p>
              <p className="text-gray-600">{selectedUser.email}</p>
              <p className="text-gray-600">Role: {selectedUser.role}</p>
              <p className="text-gray-600">
                Metrics: {selectedUser.metrics?.tasks || 0} tasks,{" "}
                {selectedUser.metrics?.activities || 0} activities
              </p>
            </div>
            <div className="space-y-2">
              {selectedActivities.map((item) => (
                <div key={item._id} className="rounded-md border border-gray-100 bg-gray-50 p-2">
                  <p className="font-semibold text-slate-800">{item.message}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Select a user to view details.</p>
        )}
      </section>
    </>
  );
};

export default Admin;
