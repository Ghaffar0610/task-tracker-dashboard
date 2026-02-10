import { useState } from "react";
import ProfileModal from "./ProfileModal";
import UserAvatar from "./UserAvatar";

const UserProfileButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        <UserAvatar />
      </button>
      <ProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default UserProfileButton;
