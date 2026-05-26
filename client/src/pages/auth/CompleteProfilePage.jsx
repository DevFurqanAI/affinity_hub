import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import AuthShell from "../../components/auth/AuthShell.jsx";
import useAuthStore from "../../store/authStore.js";
import userService from "../../services/userService.js";
import {
  getNextOnboardingPath,
  needsEmailVerification,
  needsProfileSetup,
  needsInterestsSetup
} from "../../utils/onboarding.js";

function CompleteProfilePage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const completeProfile = useAuthStore((state) => state.completeProfile);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: ""
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || ""
      });

      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsEmailVerification(user)) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!needsProfileSetup(user)) {
    if (needsInterestsSetup(user)) {
      return <Navigate to="/choose-interests" replace />;
    }

    return <Navigate to={getNextOnboardingPath(user)} replace />;
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

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (avatarFile) {
        setIsAvatarUploading(true);

        try {
          await userService.updateAvatar(avatarFile);
        } catch (error) {
          const message =
            error.response?.data?.message || "Avatar upload failed";

          toast.error(message);
          return;
        } finally {
          setIsAvatarUploading(false);
        }
      }

      const result = await completeProfile(formData);

      if (result.success) {
        navigate("/choose-interests", { replace: true });
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to complete profile";

      toast.error(message);
    }
  };

  const isSaving = isLoading || isAvatarUploading;
  const avatarText = formData.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <AuthShell
      eyebrow="Build Your Identity"
      title="Complete your profile"
      description="Choose how other students will discover and recognize you."
      footer={
        <p className="text-xs">
          Your profile information can be edited later.
        </p>
      }
    >
      <div className="mb-6 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
            Profile Setup
          </p>

          <p className="mt-1 text-xs font-bold text-[var(--color-text)]">
            Public student identity
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-7 rounded-full bg-rose-500" />
          <span className="h-1.5 w-7 rounded-full bg-rose-500" />
          <span className="h-1.5 w-7 rounded-full bg-[var(--color-border)]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <div className="shrink-0 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]">
            <div className="rounded-full bg-[var(--color-surface)] p-[3px]">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] text-xl font-black text-[var(--color-text)]">
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

          <div className="min-w-0">
            <p className="text-xs font-black text-[var(--color-text)]">
              Profile photo
            </p>

            <label className="mt-1 inline-block cursor-pointer text-[11px] font-black text-[#0095f6] transition hover:text-blue-500">
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isSaving}
                className="hidden"
              />
            </label>

            <p className="mt-1 truncate text-[10px] text-[var(--color-text-muted)]">
              {avatarFile ? avatarFile.name : "JPG, PNG or WEBP"}
            </p>
          </div>
        </div>

        <Input
          id="name"
          label="Display Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Saleha Eisha"
          required
        />

        <Input
          id="username"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="saleha.eisha"
          helper="This becomes your public profile identity."
          required
        />

        <div>
          <label
            htmlFor="bio"
            className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
          >
            Biography
          </label>

          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            maxLength={250}
            disabled={isSaving}
            placeholder="Tell the lounge something about yourself..."
            className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] disabled:opacity-60"
          />

          <p className="mt-1.5 text-right text-[10px] font-bold text-[var(--color-text-muted)]">
            {formData.bio.length}/250
          </p>
        </div>

        <Button
          type="submit"
          className="w-full !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
          disabled={isSaving}
        >
          {isAvatarUploading
            ? "Uploading photo..."
            : isLoading
              ? "Saving profile..."
              : "Save and Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default CompleteProfilePage;