import { createPortal } from "react-dom";

const TaskModal = ({
  isOpen,
  isEditing,
  title,
  description,
  status,
  error,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="flex h-full w-full items-end justify-center px-4 pb-4 pt-8 sm:items-center sm:pb-0">
        <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-[#1e293b]">
              {isEditing ? "Edit Task" : "Add Task"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-xl text-gray-400 hover:text-gray-600"
            >
              x
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 px-4 py-5 sm:px-6">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={onTitleChange}
                className="mt-2 w-full rounded-md border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Description
              </label>
              <textarea
                value={description}
                onChange={onDescriptionChange}
                rows={4}
                className="mt-2 w-full rounded-md border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Status
              </label>
              <select
                value={status}
                onChange={onStatusChange}
                className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskModal;
