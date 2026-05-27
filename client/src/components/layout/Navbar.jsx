import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate
} from "react-router-dom";
import {
  Compass,
  Heart,
  Home,
  MoreHorizontal,
  Palette,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  UserRound
} from "lucide-react";

import AffinityHubLogo from "../branding/AffinityHubLogo.jsx";
import useTheme from "../../hooks/useTheme.js";
import useAuthStore from "../../store/authStore.js";

const mobileLinks = [
  {
    label: "Home",
    path: "/home",
    icon: Home
  },
  {
    label: "Search",
    path: "/search",
    icon: Search
  },
  {
    label: "Explore",
    path: "/explore",
    icon: Compass
  },
  {
    label: "Alerts",
    path: "/notifications",
    icon: Heart
  }
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { theme, setTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobileMenuRef = useRef(null);

  const profileAvatar = user?.avatar;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!mobileMenuRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSwitchAppearance = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setIsMobileMenuOpen(false);
  };

  const handleOpenCreatePost = () => {
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new Event("affinity-open-create-post"));
  };

  const mobileMenuButtonClasses =
    "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]";

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            to={isAuthenticated ? "/home" : "/"}
            aria-label="Affinity Hub Home"
          >
            <AffinityHubLogo compact />
          </Link>

          {isAuthenticated ? (
            <div ref={mobileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                aria-label="Open more options"
                aria-expanded={isMobileMenuOpen}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                  isMobileMenuOpen
                    ? "border-rose-500/30 bg-[var(--color-surface-muted)] text-rose-500"
                    : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                }`}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {isMobileMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.65rem)] z-[70] w-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2 shadow-2xl">
                  <button
                    type="button"
                    onClick={handleOpenCreatePost}
                    className={mobileMenuButtonClasses}
                  >
                    <PlusCircle className="h-5 w-5 shrink-0 text-amber-500" />
                    <span>Create Post</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/settings");
                    }}
                    className={mobileMenuButtonClasses}
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSwitchAppearance}
                    className={mobileMenuButtonClasses}
                  >
                    <Palette className="h-5 w-5 shrink-0 text-amber-500" />
                    <span>Switch Appearance</span>
                  </button>

                  {user?.role === "admin" ? (
                    <>
                      <div className="my-2 border-t border-[var(--color-border)]" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/admin");
                        }}
                        className={mobileMenuButtonClasses}
                      >
                        <ShieldCheck className="h-5 w-5 shrink-0 text-rose-500" />
                        <span>Admin Control Center</span>
                      </button>
                    </>
                  ) : null}

                  <div className="my-2 border-t border-[var(--color-border)]" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-bold text-rose-500 transition hover:bg-rose-500/10"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-500"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Desktop UiLab-style Header */}
      {isAuthenticated ? (
        <header className="fixed left-[72px] right-0 top-0 z-20 hidden h-20 items-center border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md lg:flex">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6">
            <Link to="/home" className="group">
              <h1 className="mt-2 flex items-center gap-2 text-base font-black tracking-tight text-[var(--color-text)]">
                <span>Affinity Central Timeline</span>

                <span
                  className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm"
                  title="Online"
                />
              </h1>
            </Link>
          </div>
        </header>
      ) : null}

      {/* Mobile Bottom Navigation */}
      {isAuthenticated ? (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
          <div className="grid h-16 grid-cols-5 items-center px-3">
            {mobileLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  aria-label={link.label}
                  className={({ isActive }) =>
                    `mx-auto flex h-11 w-11 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-[var(--color-surface-muted)] text-rose-500"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-5.5 w-5.5 ${
                          link.path === "/notifications" && isActive
                            ? "fill-rose-500"
                            : ""
                        }`}
                      />
                      <span className="sr-only">{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            <NavLink
              to="/me"
              aria-label="Profile"
              className={({ isActive }) =>
                `mx-auto flex h-11 w-11 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-[var(--color-surface-muted)]"
                    : "hover:bg-[var(--color-surface-muted)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 transition ${
                      isActive
                        ? "border-rose-500"
                        : "border-[var(--color-border-strong)]"
                    }`}
                  >
                    {profileAvatar ? (
                      <img
                        src={profileAvatar}
                        alt={user?.name || "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-4 w-4 text-[var(--color-text-muted)]" />
                    )}
                  </span>

                  <span className="sr-only">Profile</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>
      ) : null}
    </>
  );
}

export default Navbar;