import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Offline() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [notice, setNotice] = useState("");

  const goHomePath = useMemo(
    () => (isAuthenticated ? "/dashboard" : "/"),
    [isAuthenticated]
  );

  const handleRetry = () => {
    if (navigator.onLine) {
      navigate(goHomePath, { replace: true });
      return;
    }
    setNotice("Still offline. Reconnect to continue.");
  };

  const handleGoHome = () => {
    if (!navigator.onLine) {
      setNotice("Go Home works after internet reconnects.");
      return;
    }
    navigate(goHomePath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f1f3f8] flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-100 shadow-md p-8 text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-4xl">
          !
        </div>
        <h1 className="text-3xl font-bold text-[#1e293b]">You are offline</h1>
        <p className="mt-3 text-sm text-gray-500">
          Internet connection was lost. Reconnect and try again.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="rounded-md border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go Home
          </button>
        </div>
        {notice ? <p className="mt-4 text-sm text-amber-600">{notice}</p> : null}
      </div>
    </div>
  );
}

export default Offline;
