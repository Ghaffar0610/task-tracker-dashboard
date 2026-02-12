import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import getCroppedImg from "../utils/cropImage";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");
  const [isGeneratingRecoveryCodes, setIsGeneratingRecoveryCodes] = useState(false);
  const passwordSectionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || "");
      setImageSrc("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setPasswordSuccess("");
      setShowPasswordForm(false);
      setRecoveryCodes([]);
      setRecoveryError("");
      setRecoverySuccess("");
    }
  }, [isOpen, user?.name]);

  useEffect(() => {
    if (showPasswordForm) {
      passwordSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showPasswordForm]);

  if (!isOpen) return null;

  const onCropComplete = (_croppedArea, croppedAreaPixelsValue) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be 2MB or less.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result?.toString() || "");
    });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (imageSrc && croppedAreaPixels) {
        const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedFile) {
          formData.append("avatar", croppedFile, "avatar.jpg");
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/api/users/me`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to update profile.");
        setIsSaving(false);
        return;
      }

      updateUser(data);
      setIsSaving(false);
      onClose();
    } catch (err) {
      setError("Unable to reach the server.");
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Current and new password are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/me/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data.message || "Unable to update password.");
        setIsChangingPassword(false);
        return;
      }
      setPasswordSuccess("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError("Unable to reach the server.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleGenerateRecoveryCodes = async () => {
    setRecoveryError("");
    setRecoverySuccess("");
    setIsGeneratingRecoveryCodes(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/me/recovery-codes/regenerate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setRecoveryError(data.message || "Unable to generate recovery codes.");
        setIsGeneratingRecoveryCodes(false);
        return;
      }
      setRecoveryCodes(data.recoveryCodes || []);
      setRecoverySuccess(
        "New recovery codes generated. Save them now. Old codes no longer work."
      );
    } catch (_err) {
      setRecoveryError("Unable to reach the server.");
    } finally {
      setIsGeneratingRecoveryCodes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="flex h-full w-full items-end justify-center px-4 pb-4 pt-8 sm:items-center sm:pb-0">
        <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-[#1e293b]">
              Edit Profile
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-xl text-gray-400 hover:text-gray-600"
            >
              x
            </button>
          </div>

          <div className="space-y-6 px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2 w-full text-sm text-gray-700"
                />
              </div>

              {imageSrc ? (
                <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              ) : null}

              {imageSrc ? (
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Zoom
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="mt-2 w-full"
                  />
                </div>
              ) : null}

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>

            <div
              ref={passwordSectionRef}
              className="border-t border-gray-100 pt-4"
            >
              <button
                type="button"
                onClick={() => setShowPasswordForm((prev) => !prev)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                {showPasswordForm
                  ? "Cancel Password Change"
                  : "Change Password"}
              </button>

              {showPasswordForm ? (
                <form
                  onSubmit={handlePasswordChange}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  {passwordError ? (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  ) : null}
                  {passwordSuccess ? (
                    <p className="text-sm text-green-600">{passwordSuccess}</p>
                  ) : null}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Saving..." : "Update Password"}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#1e293b]">
                Account Recovery Codes
              </h3>
              <p className="text-xs text-gray-500">
                Use these codes to reset password if you forget it. Each code
                can be used once.
              </p>
              <button
                type="button"
                onClick={handleGenerateRecoveryCodes}
                disabled={isGeneratingRecoveryCodes}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {isGeneratingRecoveryCodes
                  ? "Generating..."
                  : "Generate New Recovery Codes"}
              </button>
              {recoveryError ? (
                <p className="text-sm text-red-500">{recoveryError}</p>
              ) : null}
              {recoverySuccess ? (
                <p className="text-sm text-green-600">{recoverySuccess}</p>
              ) : null}
              {recoveryCodes.length > 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code) => (
                      <code
                        key={code}
                        className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

