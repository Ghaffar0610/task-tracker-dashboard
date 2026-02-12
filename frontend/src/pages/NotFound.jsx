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
    <div className="min-h-screen bg-[#f1f3f8] flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-100 shadow-md p-8 text-center">
        <img
          src={notFoundImage}
          alt="Page not found illustration"
          className="mx-auto mb-6 h-24 w-24 rounded-full object-cover"
        />
        <h1 className="text-4xl font-bold text-[#1e293b]">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-[#1e293b]">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm text-gray-500">
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
