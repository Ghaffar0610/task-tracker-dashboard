import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import notFoundImage from "../assets/OIP.webp";

function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const goHomePath = useMemo(
    () => (isAuthenticated ? "/dashboard" : "/"),
    [isAuthenticated]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f3f8] px-4 dark:bg-slate-950">
      <div className="w-full max-w-xl rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-md dark:border-slate-800 dark:bg-slate-900">
        <img
          src={notFoundImage}
          alt="Page not found illustration"
          className="mx-auto mb-6 h-24 w-24 rounded-full object-cover"
        />
        <h1 className="text-4xl font-bold text-[#1e293b] dark:text-slate-100">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-[#1e293b] dark:text-slate-100">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm text-gray-500 dark:text-slate-300">
          Oops! The page you are looking for does not exist.
        </p>
        <button
          type="button"
          onClick={() => navigate(goHomePath, { replace: true })}
          className="mt-8 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;
