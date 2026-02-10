import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import UserProfileButton from "../components/UserProfileButton";
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
  const [filter, setFilter] = useState("all");
  const [duplicateConfirm, setDuplicateConfirm] = useState(null);

  useEffect(() => {
    const next = searchParams.get("status");
    if (next === "completed" || next === "pending") {
      setFilter(next);
    } else {
      setFilter("all");
    }
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
    <Layout>
      <PageHeader
        title="Your Tasks"
        right={
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
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
            setFilter(next);
            if (next === "all") {
              searchParams.delete("status");
              setSearchParams(searchParams);
            } else {
              setSearchParams({ status: next });
            }
          }}
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
              <div className="flex h-full w-full items-center justify-center px-4">
                <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-[#1e293b]">
                      Duplicate Task
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setDuplicateConfirm(null);
                        setIsModalOpen(true);
                      }}
                      className="text-xl text-gray-400 hover:text-gray-600"
                    >
                      x
                    </button>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-gray-600">
                      A task with the same title already exists. Do you still
                      want to add it?
                    </p>
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setDuplicateConfirm(null);
                          setIsModalOpen(true);
                        }}
                        className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmDuplicateAdd}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
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
    </Layout>
  );
};

export default Tasks;
