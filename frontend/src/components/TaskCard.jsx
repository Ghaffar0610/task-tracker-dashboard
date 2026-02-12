const statusBadgeStyles = {
  completed: "bg-green-500 text-white",
  pending: "bg-blue-500 text-white",
};

const TaskCard = ({ task, onEdit, onDelete }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#1e293b]">
            {task.title}
          </h3>
          <div className="mt-2 h-2 w-full max-w-xs rounded-full bg-gray-100" />
          {task.description ? (
            <p className="mt-2 break-words text-sm text-gray-500">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            className={`rounded-md px-3 py-2 text-xs font-semibold ${
              statusBadgeStyles[task.status]
            }`}
          >
            {task.status === "completed" ? "Completed" : "Pending"}
          </span>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
