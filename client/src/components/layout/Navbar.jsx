import { Link, NavLink, useNavigate } from "react-router-dom";

import Button from "../common/Button.jsx";
import SearchBar from "../search/SearchBar.jsx";
import NotificationDropdown from "../notifications/NotificationDropdown.jsx";
import useAuthStore from "../../store/authStore.js";

const navLinks = [
  {
    label: "Feed",
    path: "/feed"
  },
  {
    label: "Explore",
    path: "/explore"
  },
  {
    label: "Profile",
    path: "/me"
  }
];

function Navbar() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={isAuthenticated ? "/feed" : "/"}
            className="flex min-w-fit items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-sm">
              AH
            </div>

            <div>
              <p className="text-lg font-bold leading-none text-slate-900">
                Affinity Hub
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Connect. Share. Grow.
              </p>
            </div>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 xl:hidden">
              <NotificationDropdown />
            </div>
          ) : null}
        </div>

        {isAuthenticated ? (
          <div className="w-full xl:max-w-sm">
            <SearchBar compact placeholder="Search..." />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 xl:justify-end">
          {isAuthenticated ? (
            <div className="hidden items-center gap-2 lg:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.path}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {user?.role === "admin" ? (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  Admin
                </NavLink>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden xl:block">
                  <NotificationDropdown />
                </div>

                <Link
                  to="/me"
                  className="hidden items-center gap-2 rounded-full px-2 py-1 transition hover:bg-slate-100 sm:flex"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || "A"
                    )}
                  </div>

                  <div className="hidden text-right md:block">
                    <p className="text-sm font-semibold text-slate-900">
                      @{user?.username}
                    </p>
                    <p className="text-xs text-slate-500">View profile</p>
                  </div>
                </Link>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>

                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;