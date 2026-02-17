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
    <div className="flex min-h-screen items-center justify-center bg-[#f1f3f8] px-4 dark:bg-slate-950">
      <div className="w-full max-w-xl rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-4xl text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          !
        </div>
        <h1 className="text-3xl font-bold text-[#1e293b] dark:text-slate-100">You are offline</h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-slate-300">
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
            className="rounded-md border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
