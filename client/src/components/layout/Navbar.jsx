import { Link, NavLink, useNavigate } from "react-router-dom";
import { Palette } from "lucide-react";

import AffinityHubLogo from "../branding/AffinityHubLogo.jsx";
import useTheme from "../../hooks/useTheme.js";
import useAuthStore from "../../store/authStore.js";

const mobileLinks = [
  { label: "Home", path: "/home" },
  { label: "Search", path: "/search" },
  { label: "Explore", path: "/explore" },
  { label: "Alerts", path: "/notifications" },
  { label: "Me", path: "/me" }
];

function Navbar() {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSwitchAppearance = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            to={isAuthenticated ? "/home" : "/"}
            aria-label="Affinity Hub Home"
          >
            <AffinityHubLogo compact />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwitchAppearance}
              aria-label="Switch appearance"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-amber-500 transition hover:bg-[var(--color-surface-elevated)]"
            >
              <Palette className="h-4 w-4" />
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500"
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500"
              >
                Login
              </Link>
            )}
          </div>
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
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 lg:hidden">
          {mobileLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `rounded-xl px-2 py-2 text-center text-[10px] font-black uppercase tracking-tight transition ${
                  isActive
                    ? "text-rose-500"
                    : "text-[var(--color-text-muted)]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </>
  );
}

export default Navbar;