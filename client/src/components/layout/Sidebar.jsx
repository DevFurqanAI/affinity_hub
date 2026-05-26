import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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

function Sidebar({
  isSearchDrawerOpen = false,
  isNotificationsDrawerOpen = false,
  onSearchToggle,
  onNotificationsToggle
}) {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { theme, setTheme } = useTheme();

  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreMenuRef = useRef(null);

  const isDrawerOpen =
    isSearchDrawerOpen || isNotificationsDrawerOpen;

  useEffect(() => {
    if (!isMoreOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!moreMenuRef.current?.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMoreOpen]);

  if (!isAuthenticated) {
    return null;
  }

  const isExpanded =
    !isDrawerOpen && (isHovered || isFocusWithin || isMoreOpen);

  const profileAvatar = user?.avatar;

  const handleOpenCreatePost = () => {
    window.dispatchEvent(new Event("affinity-open-create-post"));
  };

  const handleLogout = async () => {
    setIsMoreOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSwitchAppearance = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    setIsMoreOpen(false);
  };

  const handleSearchToggle = () => {
    setIsMoreOpen(false);
    onSearchToggle?.();
  };

  const handleNotificationsToggle = () => {
    setIsMoreOpen(false);
    onNotificationsToggle?.();
  };

  const labelClasses = `overflow-hidden whitespace-nowrap origin-left transition-all duration-300 ease-in-out ${
    isExpanded
      ? "max-w-[150px] translate-x-0 opacity-100"
      : "pointer-events-none max-w-0 -translate-x-3 opacity-0"
  }`;

  const navLinkClasses = ({ isActive }) =>
    `group relative flex w-full items-center gap-4 rounded-xl px-3.5 py-3 text-xs font-bold transition-all duration-200 ${
      isActive
        ? "bg-[var(--color-surface-muted)] font-black text-[var(--color-text)]"
        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
    }`;

  const drawerButtonClasses = (isActive) =>
    `group relative flex w-full items-center gap-4 rounded-xl px-3.5 py-3 text-xs font-bold transition-all duration-200 ${
      isActive
        ? "bg-[var(--color-surface-muted)] font-black text-[var(--color-text)]"
        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
    }`;

  const buttonClasses =
    "group relative flex w-full items-center gap-4 rounded-xl px-3.5 py-3 text-xs font-bold text-[var(--color-text-muted)] transition-all duration-200 hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]";

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocusWithin(false);
        }
      }}
      className={`fixed bottom-0 left-0 top-0 z-50 hidden select-none flex-col justify-between border-r bg-[var(--color-surface)] transition-[width] duration-300 ease-in-out lg:flex ${
        isExpanded ? "w-[244px]" : "w-[72px]"
      }`}
    >
      <div>
        {/* Brand Logo */}
        <div className="flex flex-col items-start px-5 pt-7">
          <Link
            to="/home"
            className="flex w-full min-w-0 items-center gap-3.5"
            aria-label="Affinity Hub Home"
          >
            <div className="shrink-0">
              <AffinityHubLogo compact showText={false} />
            </div>

            <div className={`flex flex-col ${labelClasses}`}>
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 bg-clip-text text-sm font-black uppercase leading-none tracking-tight text-transparent">
                Affinity Hub
              </span>

              <span className="mt-1 text-[8px] font-bold uppercase leading-none tracking-[0.22em] text-[var(--color-text-muted)]">
                Public Lounge
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 px-3 py-7">
          <NavLink to="/home" className={navLinkClasses}>
            {({ isActive }) => (
              <>
                <Home
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive && !isDrawerOpen ? "text-rose-500" : ""
                  }`}
                />
                <span className={labelClasses}>Home</span>
              </>
            )}
          </NavLink>

          <button
            type="button"
            onClick={handleSearchToggle}
            aria-expanded={isSearchDrawerOpen}
            className={drawerButtonClasses(isSearchDrawerOpen)}
          >
            <Search
              className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isSearchDrawerOpen ? "text-rose-500" : ""
              }`}
            />
            <span className={labelClasses}>Search</span>
          </button>

          <NavLink to="/explore" className={navLinkClasses}>
            {({ isActive }) => (
              <>
                <Compass
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive && !isDrawerOpen ? "text-rose-500" : ""
                  }`}
                />
                <span className={labelClasses}>Explore</span>
              </>
            )}
          </NavLink>

          <button
            type="button"
            onClick={handleNotificationsToggle}
            aria-expanded={isNotificationsDrawerOpen}
            className={drawerButtonClasses(isNotificationsDrawerOpen)}
          >
            <Heart
              className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isNotificationsDrawerOpen
                  ? "fill-rose-500 text-rose-500"
                  : ""
              }`}
            />
            <span className={labelClasses}>Notifications</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreatePost}
            className={buttonClasses}
            aria-label="Create Post"
          >
            <PlusCircle className="h-5 w-5 shrink-0 text-amber-500 transition-transform duration-200 group-hover:scale-110" />
            <span className={labelClasses}>Create</span>
          </button>

          <NavLink to="/me" className={navLinkClasses}>
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-transform duration-200 group-hover:scale-105 ${
                    isActive && !isDrawerOpen
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

                <span className={labelClasses}>Profile</span>
              </>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Bottom Options */}
      <div ref={moreMenuRef} className="relative px-3 pb-5">
        {isMoreOpen ? (
          <div className="absolute bottom-full left-1 mb-2.5 w-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5 shadow-2xl">
            {user?.role === "admin" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    navigate("/admin");
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
                >
                  <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-rose-500" />
                  <span>Admin Control Center</span>
                </button>

                <div className="my-1.5 border-t border-[var(--color-border)]" />
              </>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(false);
                navigate("/settings");
              }}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            >
              <Settings className="h-[18px] w-[18px] shrink-0 text-[var(--color-text-muted)] transition group-hover:text-[var(--color-text)]" />
              <span>Settings</span>
            </button>
            
            <button
              type="button"
              onClick={handleSwitchAppearance}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            >
              <Palette className="h-[18px] w-[18px] shrink-0 text-amber-500" />
              <span>Switch Appearance</span>
            </button>

            <div className="my-1.5 border-t border-[var(--color-border)]" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-500 transition-colors hover:bg-rose-500/10"
            >
              Log out
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsMoreOpen((value) => !value)}
          aria-expanded={isMoreOpen}
          className={`group flex h-12 w-full items-center gap-4 rounded-xl px-3.5 text-xs font-bold transition-all duration-200 ${
            isMoreOpen
              ? "bg-[var(--color-surface-muted)] text-[var(--color-text)]"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <MoreHorizontal
            className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
              isMoreOpen ? "text-rose-500" : ""
            }`}
          />
          <span className={labelClasses}>More</span>
        </button>

        <div
          className={`overflow-hidden border-t border-[var(--color-border)] transition-all duration-300 ${
            isExpanded
              ? "mt-3 max-h-16 px-3.5 pb-1 pt-3 opacity-100"
              : "pointer-events-none mt-0 max-h-0 border-transparent px-3.5 py-0 opacity-0"
          }`}
        >
          <p className="text-[9px] font-medium text-[var(--color-text-muted)]">
            Affinity Core Platform
          </p>
          <p className="mt-1.5 text-[9px] font-medium text-[var(--color-text-muted)]">
            © 2026 AFFINITY HUB
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;