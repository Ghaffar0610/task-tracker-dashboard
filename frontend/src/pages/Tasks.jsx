import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import UserProfileButton from "../components/UserProfileButton";
import NotificationBell from "../components/NotificationBell";
import CalendarQuickView from "../components/CalendarQuickView";
import { useTasks } from "../context/TaskContext";

const Tasks = () => {
  const { tasks, addTask, deleteTask, updateTask, isLoading, error: apiError } =
    useTasks();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [duplicateConfirm, setDuplicateConfirm] = useState(null);

  const filter = useMemo(() => {
    const next = searchParams.get("status");
    return next === "completed" || next === "pending" ? next : "all";
  }, [searchParams]);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) =>
      filter === "all" ? true : task.status === filter
    );
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
      const normalizedTitle = title.trim().toLowerCase();
      const hasDuplicate = tasks.some(
        (task) => task.title.trim().toLowerCase() === normalizedTitle
      );
      if (hasDuplicate) {
        setIsModalOpen(false);
        setDuplicateConfirm({
          title: title.trim(),
          description: description.trim(),
          status,
        });
        return;
      }
      await addTask(title.trim(), description.trim(), status);
    }

    closeModal();
  };

  const confirmDuplicateAdd = async () => {
    if (!duplicateConfirm) return;
    await addTask(
      duplicateConfirm.title,
      duplicateConfirm.description,
      duplicateConfirm.status
    );
    setDuplicateConfirm(null);
    closeModal();
  };

  return (
    <>
      <PageHeader
        title="Your Tasks"
        right={
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <NotificationBell />
            <CalendarQuickView />
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add Task
            </button>
            <UserProfileButton />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(event) => {
            const next = event.target.value;
            if (next === "all") {
              setSearchParams({});
            } else {
              setSearchParams({ status: next });
            }
          }}
          className="min-h-11 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-blue-900"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {apiError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {apiError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Loading tasks...
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            No tasks yet. Click "Add Task" to create one.
          </div>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={openEditModal}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        isEditing={Boolean(editingTaskId)}
        title={title}
        description={description}
        status={status}
        error={error}
        onClose={closeModal}
        onTitleChange={(event) => setTitle(event.target.value)}
        onDescriptionChange={(event) => setDescription(event.target.value)}
        onStatusChange={(event) => setStatus(event.target.value)}
        onSubmit={handleSave}
      />

      {duplicateConfirm
        ? createPortal(
            <div className="fixed inset-0 z-[1000] bg-black/40">
              <div className="flex h-full w-full items-end justify-center px-4 pb-4 pt-8 sm:items-center sm:pb-0">
                <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-950">
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-[#1e293b] dark:text-slate-100">
                      Duplicate Task
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setDuplicateConfirm(null);
                        setIsModalOpen(true);
                      }}
                      className="text-xl text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      x
                    </button>
                  </div>
                  <div className="space-y-4 px-4 py-5 sm:px-6">
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      A task with the same title already exists. Do you still
                      want to add it?
                    </p>
                    <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setDuplicateConfirm(null);
                          setIsModalOpen(true);
                        }}
                        className="rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmDuplicateAdd}
                        className="rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                      >
                        Add Anyway
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export default Tasks;
