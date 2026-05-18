import { NavLink } from "react-router-dom";

import useAuthStore from "../../store/authStore.js";

function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  const sidebarLinks = [
    {
      label: "Home",
      path: "/home"
    },
    {
      label: "Explore",
      path: "/explore"
    },
    {
      label: "Search",
      path: "/search"
    },
    {
      label: "Notifications",
      path: "/notifications"
    },
    {
      label: "My Profile",
      path: "/me"
    }
  ];

  const adminLinks = [
    {
      label: "Admin Dashboard",
      path: "/admin"
    },
    {
      label: "Reports",
      path: "/admin/reports"
    }
  ];

  const linkClasses = ({ isActive }) =>
    `flex w-full items-center rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="px-3 text-sm font-bold uppercase tracking-wide text-slate-400">
          Menu
        </h2>

        <div className="mt-4 space-y-2">
          {sidebarLinks.map((link) => (
            <NavLink key={link.label} to={link.path} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {user?.role === "admin" ? (
          <>
            <div className="my-4 border-t border-slate-100" />

            <h2 className="px-3 text-sm font-bold uppercase tracking-wide text-slate-400">
              Admin
            </h2>

            <div className="mt-4 space-y-2">
              {adminLinks.map((link) => (
                <NavLink key={link.label} to={link.path} className={linkClasses}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </>
        ) : null}

        <div className="mt-6 rounded-2xl bg-slate-900 p-4 text-white">
          <p className="text-sm font-semibold">Affinity Hub</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {user?.role === "admin"
              ? "Moderation tools are enabled."
              : "Your main social page is ready."}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;