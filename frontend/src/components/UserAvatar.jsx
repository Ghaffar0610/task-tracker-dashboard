import { useAuth } from "../context/AuthContext";

const getAvatarSrc = (avatarUrl) => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http")) return avatarUrl;
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${base}${avatarUrl}`;
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserAvatar = () => {
  const { user } = useAuth();
  const initials = getInitials(user?.name);
  const avatarSrc = getAvatarSrc(user?.avatarUrl);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={user?.name || "User avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="bg-blue-500 w-full h-full flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
