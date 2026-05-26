import { useEffect, useState } from "react";

import Loader from "../common/Loader.jsx";

function EditProfileModal({
  user,
  isOpen,
  onClose,
  onProfileUpdate,
  onAvatarUpdate,
  isLoading
}) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: ""
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [temporaryPreviewUrl, setTemporaryPreviewUrl] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || ""
    });

    setAvatarFile(null);
    setAvatarPreview(user?.avatar || "");
    setTemporaryPreviewUrl("");
  }, [
    isOpen,
    user?._id,
    user?.name,
    user?.username,
    user?.bio,
    user?.avatar
  ]);

  useEffect(() => {
    return () => {
      if (temporaryPreviewUrl) {
        URL.revokeObjectURL(temporaryPreviewUrl);
      }
    };
  }, [temporaryPreviewUrl]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setTemporaryPreviewUrl(nextPreviewUrl);
    setAvatarPreview(nextPreviewUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const profileResult = await onProfileUpdate({
      name: formData.name,
      username: formData.username,
      bio: formData.bio
    });

    if (!profileResult) {
      return;
    }

    if (avatarFile) {
      const avatarResult = await onAvatarUpdate(avatarFile);

      if (!avatarResult) {
        return;
      }
    }

    onClose();
  };

  const handleOverlayClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const avatarText = formData.name?.charAt(0)?.toUpperCase() || "A";

  const inputClasses =
    "w-full rounded-lg border border-neutral-200 bg-[#fcfcfc] px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-rose-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200";

  const labelClasses =
    "mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-zinc-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      onMouseDown={handleOverlayClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-zinc-900 dark:bg-zinc-950"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5 dark:border-zinc-900">
          <div>
            <h2
              id="edit-profile-title"
              className="text-lg font-black tracking-tight text-neutral-900 dark:text-white"
            >
              Edit Profile
            </h2>

            <p className="mt-1 text-[11px] text-neutral-500 dark:text-zinc-500">
              Manage your central identity information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOverlayClose}
            disabled={isLoading}
            aria-label="Close edit profile"
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Avatar Row */}
          <div className="flex items-center gap-4 border-b border-neutral-200 pb-5 dark:border-zinc-900">
            <div className="shrink-0 rounded-full bg-gradient-to-tr from-[#fe3b6a] via-[#ff5a3b] to-[#ffaa3b] p-[2px]">
              <div className="rounded-full bg-white p-[2px] dark:bg-zinc-950">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-xl font-black text-neutral-700 dark:bg-zinc-900 dark:text-zinc-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarText
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-black text-neutral-900 dark:text-white">
                @{formData.username || "username"}
              </p>

              <label className="mt-1 inline-block cursor-pointer text-[11px] font-bold text-[#0095f6] transition hover:text-[#006db5]">
                Change profile photo
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>

              <p className="mt-1 text-[10px] text-neutral-400 dark:text-zinc-600">
                JPG, PNG or WEBP. Max 2MB.
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className={labelClasses}>
              Display Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`${inputClasses} font-bold disabled:cursor-not-allowed disabled:opacity-60`}
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className={labelClasses}>
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`${inputClasses} font-mono text-xs disabled:cursor-not-allowed disabled:opacity-60`}
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className={labelClasses}>
              Biography Statement
            </label>

            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              maxLength={250}
              disabled={isLoading}
              placeholder="Tell the lounge about yourself."
              className={`${inputClasses} resize-none disabled:cursor-not-allowed disabled:opacity-60`}
            />

            <p className="mt-2 text-right text-[10px] font-bold text-neutral-400 dark:text-zinc-600">
              {formData.bio.length}/250
            </p>
          </div>

          {isLoading ? <Loader text="Saving profile..." /> : null}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 dark:border-zinc-900 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleOverlayClose}
              disabled={isLoading}
              className="rounded-lg border border-neutral-200 bg-neutral-100 px-5 py-3 text-xs font-extrabold text-neutral-800 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-[#0095f6] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Submit Updates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;