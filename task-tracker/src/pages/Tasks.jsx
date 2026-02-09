import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useTasks } from "../context/TaskContext";

const statusBadgeStyles = {
  completed: "bg-green-500 text-white",
  pending: "bg-blue-500 text-white",
};

const Tasks = () => {
  const { tasks, addTask, deleteTask, updateTask, isLoading, error: apiError } =
    useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => (filter === "all" ? true : task.status === filter));
  }, [tasks, filter]);

  const openAddModal = () => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setStatus("pending");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (editingTaskId) {
      await updateTask(editingTaskId, {
        title: title.trim(),
        description: description.trim(),
        status,
      });
    } else {
      await addTask(title.trim(), description.trim(), status);
    }

    closeModal();
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f9]">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-[#1e293b]">Your Tasks</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add Task
            </button>
            <div className="h-10 w-10 rounded-full border-2 border-gray-200 bg-gray-100" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid gap-4">
          {apiError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {apiError}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
              Loading tasks...
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
              No tasks yet. Click “Add Task” to create one.
            </div>
          ) : (
            visibleTasks.map((task) => (
              <div
                key={task._id}
                className="rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[#1e293b]">
                      {task.title}
                    </h3>
                    <div className="mt-2 h-2 w-48 rounded-full bg-gray-100" />
                    {task.description ? (
                      <p className="mt-2 text-sm text-gray-500">
                        {task.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${
                        statusBadgeStyles[task.status]
                      }`}
                    >
                      {task.status === "completed" ? "Completed" : "Pending"}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(task)}
                      className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(task._id)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">
                {editingTaskId ? "Edit Task" : "Add Task"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 px-6 py-5">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Tasks;
