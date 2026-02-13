import PageHeader from "../components/PageHeader";
import NotificationBell from "../components/NotificationBell";
import UserProfileButton from "../components/UserProfileButton";

const Calendar = () => {
  return (
    <>
      <PageHeader
        title="Calendar"
        right={
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <NotificationBell />
            <UserProfileButton />
          </div>
        }
      />

      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Calendar view is a placeholder for now. Next step is wiring task due
          dates into a real calendar grid.
        </p>
      </div>
    </>
  );
};

export default Calendar;

