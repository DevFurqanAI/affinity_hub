import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import Input from "../../components/common/Input.jsx";
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-xl font-black text-white">
            AH
          </div>

          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Complete your profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Choose how people will see you on Affinity Hub.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-slate-200 text-3xl font-bold text-slate-700">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  formData.name?.charAt(0)?.toUpperCase() || "A"
                )}
              </div>

              <label className="cursor-pointer rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Upload Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              {avatarFile ? (
                <p className="text-xs text-slate-500">
                  Selected: {avatarFile.name}
                </p>
              ) : null}
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
              helper="Lowercase letters, numbers, underscore, and dot are allowed."
              required
            />

            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Bio
              </label>

              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                maxLength={250}
                placeholder="Tell people a little about yourself..."
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {formData.bio.length}/250
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isAvatarUploading
                ? "Uploading avatar..."
                : isLoading
                  ? "Saving..."
                  : "Save and Continue"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default CompleteProfilePage;