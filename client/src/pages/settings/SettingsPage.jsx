import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  ChevronRight,
  Globe,
  Link2,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  UserRound
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import Input from "../../components/common/Input.jsx";
import AccountSecurityPanel from "../../components/settings/AccountSecurityPanel.jsx";
import LinkedAccountsPanel from "../../components/settings/LinkedAccountsPanel.jsx";
import useTheme from "../../hooks/useTheme.js";
import blockService from "../../services/blockService.js";
import userService from "../../services/userService.js";
import useAuthStore from "../../store/authStore.js";

const settingsSections = [
  {
    group: "Personal",
    items: [
      {
        id: "profile",
        label: "Edit Profile",
        icon: UserRound,
        accent: "text-rose-500"
      },
      {
        id: "appearance",
        label: "Appearance",
        icon: Palette,
        accent: "text-amber-500"
      }
    ]
  },
  {
    group: "Account",
    items: [
      {
        id: "account",
        label: "Account & Security",
        icon: ShieldCheck,
        accent: "text-blue-500"
      },
      {
        id: "linked",
        label: "Linked Accounts",
        icon: Link2,
        accent: "text-violet-500"
      }
    ]
  },
  {
    group: "Safety",
    items: [
      {
        id: "blocked",
        label: "Blocked Accounts",
        icon: Ban,
        accent: "text-rose-500"
      },
      {
        id: "danger",
        label: "Danger Zone",
        icon: AlertTriangle,
        accent: "text-red-500"
      }
    ]
  }
];

const settingsItems = settingsSections.flatMap((section) => section.items);

const themeOptions = [
  {
    value: "light",
    label: "Light",
    description: "Bright workspace appearance.",
    icon: Sun
  },
  {
    value: "dark",
    label: "Dark",
    description: "High-contrast lounge appearance.",
    icon: Moon
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device preference.",
    icon: Globe
  }
];

function MobileSettingsTabs({ activeSection, onSelect }) {
  return (
    <nav
      aria-label="Settings sections"
      className="sticky top-16 z-20 -mx-4 mt-6 border-y border-[var(--color-border)] bg-[var(--color-bg)]/95 py-3 backdrop-blur-md lg:hidden"
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2.5 text-xs font-bold transition ${
                isActive
                  ? "border-rose-500/30 bg-rose-500/10 text-[var(--color-text)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? item.accent : "text-[var(--color-text-muted)]"
                }`}
              />

              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const storeUser = useAuthStore((state) => state.user);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const logout = useAuthStore((state) => state.logout);

  const { theme, setTheme } = useTheme();

  const [activeSection, setActiveSection] = useState("profile");
  const [profileUser, setProfileUser] = useState(storeUser);
  const [formData, setFormData] = useState({
    name: storeUser?.name || "",
    username: storeUser?.username || "",
    bio: storeUser?.bio || ""
  });

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isBlockedLoading, setIsBlockedLoading] = useState(false);
  const [unblockingUserId, setUnblockingUserId] = useState("");
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setIsPageLoading(true);

        const result = await userService.getCurrentUserProfile();
        const user = result.data?.user;

        if (user) {
          setProfileUser(user);
          setCurrentUser(user);

          setFormData({
            name: user.name || "",
            username: user.username || "",
            bio: user.bio || ""
          });
        }
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load settings";

        toast.error(message);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadCurrentUser();
  }, [setCurrentUser]);

  useEffect(() => {
    if (activeSection !== "blocked") {
      return undefined;
    }

    const loadBlockedUsers = async () => {
      try {
        setIsBlockedLoading(true);

        const result = await blockService.getBlockedUsers();

        setBlockedUsers(result.data?.blockedUsers || []);
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load blocked accounts";

        toast.error(message);
      } finally {
        setIsBlockedLoading(false);
      }
    };

    loadBlockedUsers();

    return undefined;
  }, [activeSection]);

  const updateProfileUser = (updatedUser) => {
    if (!updatedUser) {
      return;
    }

    setProfileUser(updatedUser);
    setCurrentUser(updatedUser);

    setFormData({
      name: updatedUser.name || "",
      username: updatedUser.username || "",
      bio: updatedUser.bio || ""
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: name === "username" ? value.toLowerCase() : value
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSavingProfile(true);

      const result = await userService.updateProfile(formData);

      updateProfileUser(result.data?.user);

      toast.success(result.message || "Profile updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile";

      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const avatarFile = event.target.files?.[0];

    if (!avatarFile) {
      return;
    }

    try {
      setIsUploadingAvatar(true);

      const result = await userService.updateAvatar(avatarFile);

      updateProfileUser(result.data?.user);

      toast.success(result.message || "Profile photo updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile photo";

      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      setUnblockingUserId(userId);

      const result = await blockService.unblockUser(userId);

      setBlockedUsers((previousUsers) =>
        previousUsers.filter((user) => user._id !== userId)
      );

      toast.success(result.message || "User unblocked successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to unblock user";

      toast.error(message);
    } finally {
      setUnblockingUserId("");
    }
  };

  const handleDeactivateAccount = async (event) => {
    event.preventDefault();

    if (!deactivatePassword.trim()) {
      toast.error("Enter your password to continue");
      return;
    }

    try {
      setIsDeactivating(true);

      const result = await userService.deactivateAccount(deactivatePassword);

      toast.success(result.message || "Account deactivated successfully");

      setDeactivatePassword("");
      setIsDeactivateOpen(false);

      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to deactivate account";

      toast.error(message);
    } finally {
      setIsDeactivating(false);
    }
  };

  const renderProfilePanel = () => {
    const avatarText =
      profileUser?.name?.charAt(0)?.toUpperCase() || "A";

    return (
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-5 sm:gap-5 sm:pb-6">
          <div className="shrink-0 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]">
            <div className="rounded-full bg-[var(--color-surface)] p-[3px]">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] text-lg font-black text-[var(--color-text)] sm:h-16 sm:w-16 sm:text-xl">
                {profileUser?.avatar ? (
                  <img
                    src={profileUser.avatar}
                    alt={profileUser.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarText
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-black text-[var(--color-text)] sm:text-base">
              {profileUser?.username}
            </p>

            <label className="mt-1 inline-block cursor-pointer text-xs font-black text-[#0095f6] transition hover:text-blue-500">
              {isUploadingAvatar ? "Uploading photo..." : "Change profile photo"}

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar || isSavingProfile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <Input
          id="settings-name"
          label="Display Name"
          name="name"
          value={formData.name}
          onChange={handleFormChange}
          placeholder="Display name"
          required
        />

        <Input
          id="settings-username"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleFormChange}
          placeholder="username"
          required
        />

        <div>
          <label
            htmlFor="settings-bio"
            className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
          >
            Biography Statement
          </label>

          <textarea
            id="settings-bio"
            name="bio"
            value={formData.bio}
            onChange={handleFormChange}
            rows="4"
            maxLength={250}
            disabled={isSavingProfile}
            placeholder="Share something about yourself..."
            className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] disabled:opacity-60"
          />

          <p className="mt-1.5 text-right text-[10px] font-bold text-[var(--color-text-muted)]">
            {formData.bio.length}/250
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSavingProfile || isUploadingAvatar}
          className="w-full !border-0 !bg-[#0095f6] !text-white hover:!bg-blue-600"
        >
          {isSavingProfile ? "Saving Updates..." : "Submit Updates"}
        </Button>
      </form>
    );
  };

  const renderAppearancePanel = () => (
    <div>
      <div className="border-b border-[var(--color-border)] pb-6">
        <h2 className="text-lg font-black text-[var(--color-text)]">
          Appearance
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Choose how Affinity Hub looks across your workspace.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`rounded-xl border p-4 text-left transition ${
                isActive
                  ? "border-rose-500/40 bg-rose-500/10"
                  : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:border-rose-500/20"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-rose-500" : "text-[var(--color-text-muted)]"
                }`}
              />

              <p className="mt-4 text-sm font-black text-[var(--color-text)]">
                {option.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                {option.description}
              </p>

              {isActive ? (
                <p className="mt-4 text-[10px] font-black uppercase tracking-wide text-rose-500">
                  Selected
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderAccountPanel = () => <AccountSecurityPanel />;

  const renderLinkedAccountsPanel = () => <LinkedAccountsPanel />;

  const renderBlockedPanel = () => (
    <div>
      <div className="border-b border-[var(--color-border)] pb-6">
        <h2 className="text-lg font-black text-[var(--color-text)]">
          Blocked Accounts
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Manage profiles you previously blocked.
        </p>
      </div>

      {isBlockedLoading ? (
        <Loader text="Loading blocked accounts..." />
      ) : null}

      {!isBlockedLoading && blockedUsers.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-10 text-center">
          <Ban className="mx-auto h-6 w-6 text-[var(--color-text-muted)]" />

          <p className="mt-4 text-sm font-black text-[var(--color-text)]">
            No blocked accounts
          </p>

          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Profiles you block will appear here.
          </p>
        </div>
      ) : null}

      {!isBlockedLoading && blockedUsers.length > 0 ? (
        <div className="mt-5 space-y-2">
          {blockedUsers.map((blockedUser) => {
            const avatarText =
              blockedUser?.name?.charAt(0)?.toUpperCase() || "A";

            return (
              <div
                key={blockedUser._id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface)] text-sm font-black text-[var(--color-text)]">
                    {blockedUser.avatar ? (
                      <img
                        src={blockedUser.avatar}
                        alt={blockedUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      avatarText
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[var(--color-text)]">
                      {blockedUser.username}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                      {blockedUser.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnblockUser(blockedUser._id)}
                  disabled={unblockingUserId === blockedUser._id}
                  className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[10px] font-black uppercase tracking-wide text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {unblockingUserId === blockedUser._id
                    ? "Please wait..."
                    : "Unblock"}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  const renderDangerPanel = () => (
    <>
      <div>
        <div className="border-b border-[var(--color-border)] pb-6">
          <h2 className="text-lg font-black text-rose-500">
            Danger Zone
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Manage actions that affect your account availability and content
            visibility.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black text-[var(--color-text)]">
                Deactivate Account
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 text-[var(--color-text-muted)]">
                Temporarily hide your profile, public posts, stories, and
                suggestions. Signing in again will restore your account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDeactivateOpen(true)}
              className="shrink-0 rounded-lg border border-rose-500/25 bg-rose-500/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wide text-rose-500 transition hover:bg-rose-500/10"
            >
              Deactivate
            </button>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 opacity-65 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black text-[var(--color-text)]">
                Delete Account
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                Permanently remove your account and associated data.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="rounded-lg border border-rose-500/25 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-rose-500 opacity-50"
            >
              Not Available
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />

          <p className="text-xs leading-5 text-[var(--color-text-muted)]">
            Deactivation is temporary. Your account returns when you sign in
            successfully again. Permanent deletion will remain unavailable
            until full content-removal rules are implemented.
          </p>
        </div>
      </div>

      {isDeactivateOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeactivating) {
              setIsDeactivateOpen(false);
              setDeactivatePassword("");
            }
          }}
        >
          <form
            onSubmit={handleDeactivateAccount}
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="mt-5 text-lg font-black text-[var(--color-text)]">
              Deactivate your account?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Your profile and public content will be hidden until you sign in
              again. Enter your password to confirm.
            </p>

            <div className="mt-6">
              <Input
                id="deactivate-password"
                label="Current Password"
                type="password"
                value={deactivatePassword}
                onChange={(event) => setDeactivatePassword(event.target.value)}
                placeholder="Enter your current password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsDeactivateOpen(false);
                  setDeactivatePassword("");
                }}
                disabled={isDeactivating}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 text-xs font-black text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isDeactivating}
                className="rounded-lg bg-rose-600 px-5 py-3 text-xs font-black text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeactivating ? "Deactivating..." : "Deactivate Account"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );

  const renderActivePanel = () => {
    switch (activeSection) {
      case "appearance":
        return renderAppearancePanel();
      case "account":
        return renderAccountPanel();
      case "linked":
        return renderLinkedAccountsPanel();
      case "blocked":
        return renderBlockedPanel();
      case "danger":
        return renderDangerPanel();
      case "profile":
      default:
        return renderProfilePanel();
    }
  };

  if (isPageLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-16">
        <Loader text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Manage your profile, account security, connected services, and
          appearance preferences.
        </p>
      </header>

      {/* Mobile swipeable settings navigation */}
      <MobileSettingsTabs
        activeSection={activeSection}
        onSelect={setActiveSection}
      />

      <div className="mt-4 grid gap-6 sm:mt-6 lg:mt-8 lg:grid-cols-[255px_minmax(0,1fr)]">
        {/* Desktop Settings Navigation */}
        <aside className="hidden h-fit rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 lg:block">
          {settingsSections.map((section) => (
            <div key={section.group} className="mb-4 last:mb-0">
              <p className="px-3 pb-2 pt-2 text-[9px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                {section.group}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-bold transition ${
                        isActive
                          ? "bg-[var(--color-surface-muted)] text-[var(--color-text)]"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 ${item.accent}`} />
                        {item.label}
                      </span>

                      {isActive ? (
                        <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Active Settings Panel */}
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-7">
          {renderActivePanel()}
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;