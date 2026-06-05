import { useEffect, useState } from "react";

import Loader from "../common/Loader.jsx";

function EditProfileModal({
  user,
  isOpen,
  onClose,
  onProfileUpdate,
  onAvatarUpdate,
  onAvatarRemove,
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
      [name]: name === "username" ? value.toLowerCase() : value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (temporaryPreviewUrl) {
      URL.revokeObjectURL(temporaryPreviewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setTemporaryPreviewUrl(nextPreviewUrl);
    setAvatarPreview(nextPreviewUrl);
  };

  const handleRemoveAvatarClick = async () => {
    /*
    |--------------------------------------------------------------------------
    | Case 1: User selected a new photo but has not submitted yet.
    | In this case, "Remove" should only cancel the selected preview.
    |--------------------------------------------------------------------------
    */
    if (avatarFile) {
      if (temporaryPreviewUrl) {
        URL.revokeObjectURL(temporaryPreviewUrl);
      }

      setAvatarFile(null);
      setTemporaryPreviewUrl("");
      setAvatarPreview(user?.avatar || "");
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Case 2: User has an existing saved avatar.
    | In this case, call backend remove-avatar API through parent handler.
    |--------------------------------------------------------------------------
    */
    if (!user?.avatar) {
      return;
    }

    const confirmed = window.confirm("Remove your profile photo?");

    if (!confirmed) {
      return;
    }

    const success = await onAvatarRemove?.();

    if (success) {
      if (temporaryPreviewUrl) {
        URL.revokeObjectURL(temporaryPreviewUrl);
      }

      setAvatarFile(null);
      setTemporaryPreviewUrl("");
      setAvatarPreview("");
    }
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
    "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-rose-500 disabled:cursor-not-allowed disabled:opacity-60";

  const labelClasses =
    "mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]";

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
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[var(--color-border)] px-6 py-5">
          <div>
            <h2
              id="edit-profile-title"
              className="text-lg font-black tracking-tight text-[var(--color-text)]"
            >
              Edit Profile
            </h2>

            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              Manage your central identity information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOverlayClose}
            disabled={isLoading}
            aria-label="Close edit profile"
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] text-xl font-black text-[var(--color-text)]">
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

            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-black text-[var(--color-text)]">
                @{formData.username || "username"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="inline-block cursor-pointer text-[11px] font-bold text-[#0095f6] transition hover:text-[#006db5]">
                  Change profile photo
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>

                {(avatarPreview || user?.avatar) ? (
                  <button
                    type="button"
                    onClick={handleRemoveAvatarClick}
                    disabled={isLoading}
                    className="text-[11px] font-bold text-rose-500 transition hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {avatarFile ? "Cancel selected photo" : "Remove photo"}
                  </button>
                ) : null}
              </div>

              <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                JPG, PNG or WEBP. Max 2MB.
              </p>
            </div>
          </div>

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
              className={`${inputClasses} font-bold`}
            />
          </div>

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
              className={`${inputClasses} font-mono text-xs`}
            />
          </div>

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
              className={`${inputClasses} resize-none`}
            />

            <p className="mt-2 text-right text-[10px] font-bold text-[var(--color-text-muted)]">
              {formData.bio.length}/250
            </p>
          </div>

          {isLoading ? <Loader text="Saving profile..." /> : null}

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleOverlayClose}
              disabled={isLoading}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 text-xs font-extrabold text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
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