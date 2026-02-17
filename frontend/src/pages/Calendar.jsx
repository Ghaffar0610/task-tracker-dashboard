import PageHeader from "../components/PageHeader";
import NotificationBell from "../components/NotificationBell";
import UserProfileButton from "../components/UserProfileButton";
import CalendarQuickView from "../components/CalendarQuickView";

const Calendar = () => {
  return (
    <>
      <PageHeader
        title="Calendar"
        right={
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <NotificationBell />
            <CalendarQuickView />
            <UserProfileButton />
          </div>
        }
      />

      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Calendar view is a placeholder for now. Next step is wiring task due
          dates into a real calendar grid.
        </p>
      </div>
    </>
  );
};

export default Calendar;
