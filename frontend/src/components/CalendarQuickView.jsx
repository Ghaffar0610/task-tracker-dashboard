import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// Header calendar button: simple and reliable.
// Clicking it takes you to the /calendar page.
const CalendarQuickView = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/calendar")}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
      aria-label="Open calendar"
      title="Calendar"
    >
      <CalendarDaysIcon className="h-5 w-5" />
    </button>
  );
};

export default CalendarQuickView;

