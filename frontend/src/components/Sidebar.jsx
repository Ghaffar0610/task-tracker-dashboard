import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const linkClass = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-lg p-3 text-base transition-colors",
      isActive ? "bg-white/20" : "hover:bg-white/10",
    ].join(" ");

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    onClose?.();
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-label="Close menu overlay"
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 max-w-[82vw] flex-col overflow-y-auto bg-[#1e5bb9] p-5 text-white shadow-xl transition-transform duration-200 md:sticky md:top-0 md:z-40 md:w-64 md:max-w-none md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
      <div className="mb-8 flex items-center justify-between md:mb-10">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="h-1 w-6 bg-white"></div>
            <div className="h-1 w-6 bg-white"></div>
            <div className="h-1 w-6 bg-white"></div>
          </div>
          <h1 className="text-2xl font-bold leading-tight">Task Tracker</h1>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/30 text-xl md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          x
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          className={linkClass}
          onClick={() => onClose?.()}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-white text-[10px]">
            D
          </span>
          Dashboard
        </NavLink>
        <NavLink to="/tasks" className={linkClass} onClick={() => onClose?.()}>
          <span className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-white text-[10px]">
            T
          </span>
          Tasks
        </NavLink>
      </nav>

      <nav className="mt-auto flex flex-col gap-2 border-t border-white/20 pt-4">
        <NavLink
          to="/settings"
          className={linkClass}
          onClick={() => onClose?.()}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-white text-[10px]">
            S
          </span>
          Settings
        </NavLink>
        <button
          className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-white/10"
          onClick={handleLogout}
          type="button"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-white text-[10px]">L</span>
          Logout
        </button>
      </nav>
      </aside>
    </>
  );
};

export default Sidebar;
