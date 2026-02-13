import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const buildMonthGrid = (monthDate) => {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const startWeekday = start.getDay();
  const daysInMonth = end.getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `pad-${i}`, label: "", isToday: false });
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const isToday =
      day === today.getDate() &&
      monthDate.getMonth() === today.getMonth() &&
      monthDate.getFullYear() === today.getFullYear();
    cells.push({ key: `day-${day}`, label: String(day), isToday });
  }

  return cells;
};

// Header calendar button: opens a month-view popup (date + day grid).
const CalendarQuickView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cursorMonth, setCursorMonth] = useState(() => new Date());

  const monthLabel = useMemo(() => {
    return cursorMonth.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [cursorMonth]);

  const cells = useMemo(() => buildMonthGrid(cursorMonth), [cursorMonth]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        aria-label="Open calendar"
        title="Calendar"
      >
        <CalendarDaysIcon className="h-5 w-5" />
      </button>

      {isOpen
        ? createPortal(
            <div className="fixed inset-0 z-[1100]">
              <button
                type="button"
                aria-label="Close calendar"
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/40"
              />

              <div className="absolute left-1/2 top-20 w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Calendar
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-300">
                      {monthLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-gray-700 dark:border-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                    aria-label="Close calendar"
                  >
                    x
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCursorMonth(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                      )
                    }
                    className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCursorMonth(new Date())}
                    className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCursorMonth(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                      )
                    }
                    className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Next
                  </button>
                </div>

                <div className="px-4 pb-4">
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 dark:text-slate-400">
                    {dayLabels.map((label) => (
                      <div key={label} className="py-1">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {cells.map((cell) => (
                      <div
                        key={cell.key}
                        className={[
                          "flex h-9 items-center justify-center rounded-md text-sm",
                          cell.label
                            ? "border border-gray-100 bg-gray-50 text-gray-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                            : "",
                          cell.isToday ? "ring-2 ring-blue-300" : "",
                        ].join(" ")}
                      >
                        {cell.label}
                      </div>
                    ))}
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

export default CalendarQuickView;
