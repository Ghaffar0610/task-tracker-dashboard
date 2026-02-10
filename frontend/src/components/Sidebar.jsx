import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-lg p-3 transition-colors",
      isActive ? "bg-white/20" : "hover:bg-white/10",
    ].join(" ");

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex w-64 flex-col bg-[#1e5bb9] p-5 text-white shadow-xl">
      <div className="mb-10 flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <div className="h-1 w-6 bg-white"></div>
          <div className="h-1 w-6 bg-white"></div>
          <div className="h-1 w-6 bg-white"></div>
        </div>
        <h1 className="text-xl font-bold">Task Tracker</h1>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink to="/dashboard" className={linkClass}>
          <span className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-white text-[10px]">
            D
          </span>
          Dashboard
        </NavLink>
        <NavLink to="/tasks" className={linkClass}>
          <span className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-white text-[10px]">
            T
          </span>
          Tasks
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
    </div>
  );
};

export default Sidebar;
