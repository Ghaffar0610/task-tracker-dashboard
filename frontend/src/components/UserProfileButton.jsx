import { useEffect, useRef, useState } from "react";
import ProfileModal from "./ProfileModal";
import UserAvatar from "./UserAvatar";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import { createPortal } from "react-dom";

const getAvatarSrc = (avatarUrl) => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http") || avatarUrl.startsWith("data:")) {
    return avatarUrl;
  }
  return `${API_BASE_URL}${avatarUrl}`;
};

const UserProfileButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const containerRef = useRef(null);
  const closeMenuTimerRef = useRef(null);

  const avatarSrc = getAvatarSrc(user?.avatarUrl || "");
  const canViewPhoto = Boolean(avatarSrc);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onDocDown = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (closeMenuTimerRef.current) {
        clearTimeout(closeMenuTimerRef.current);
      }
    };
  }, []);

  const openMenu = () => {
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
    }
    setIsMenuOpen(true);
  };

  const closeMenuWithDelay = () => {
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
    }
    closeMenuTimerRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 120);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={openMenu}
        onMouseLeave={closeMenuWithDelay}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          <UserAvatar />
        </button>

        {isMenuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenuWithDelay}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              className={[
                "w-full px-3 py-2 text-left text-sm font-semibold transition-colors",
                canViewPhoto
                  ? "text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-900"
                  : "cursor-not-allowed text-gray-300 dark:text-slate-700",
              ].join(" ")}
              disabled={!canViewPhoto}
              onClick={() => {
                setIsMenuOpen(false);
                setIsViewerOpen(true);
              }}
              title={canViewPhoto ? "View profile picture" : "No picture set"}
            >
              View photo
            </button>
          </div>
        ) : null}
      </div>

      <ProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {isViewerOpen
        ? createPortal(
            <div className="fixed inset-0 z-[1200] bg-black/60">
              <button
                type="button"
                className="absolute inset-0"
                aria-label="Close profile picture"
                onClick={() => setIsViewerOpen(false)}
              />
              <div className="relative flex h-full w-full items-center justify-center p-4">
                <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-950">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Profile picture
                    </p>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-gray-700 dark:border-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                      aria-label="Close"
                      onClick={() => setIsViewerOpen(false)}
                    >
                      x
                    </button>
                  </div>
                  <div className="p-4">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user?.name ? `${user.name} avatar` : "User avatar"}
                        className="max-h-[70vh] w-full rounded-xl object-contain"
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-slate-800 dark:text-slate-300">
                        No profile picture set.
                      </div>
                    )}
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

export default UserProfileButton;
