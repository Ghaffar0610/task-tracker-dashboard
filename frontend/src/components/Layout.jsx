import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-[100dvh] bg-[#f3f4f9] text-slate-900 md:flex dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 text-[#1e293b]"
            aria-label="Open menu"
          >
            <span className="absolute block h-0.5 w-5 translate-y-1.5 bg-current"></span>
            <span className="absolute block h-0.5 w-5 -translate-y-1.5 bg-current"></span>
            <span className="absolute block h-0.5 w-5 bg-current"></span>
          </button>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Task Tracker
          </h1>
          <div className="w-11" />
        </div>

        <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6 md:space-y-8 md:p-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 px-4 py-4 text-center text-xs text-gray-500 sm:px-6 md:px-8 dark:border-slate-800 dark:text-slate-400">
          @Copyright {new Date().getFullYear()} Task Tracker Dashboard. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Layout;
