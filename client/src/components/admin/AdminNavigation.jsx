import { NavLink } from "react-router-dom";

const links = [
  {
    label: "Dashboard",
    path: "/admin",
    end: true
  },
  {
    label: "Reports",
    path: "/admin/reports"
  },
  {
    label: "Users",
    path: "/admin/users"
  },
  {
    label: "Bans",
    path: "/admin/bans"
  },
  {
    label: "Appeals",
    path: "/admin/appeals"
  }
];

function AdminNavigation() {
  return (
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.end}
          className={({ isActive }) =>
            `rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] transition ${
              isActive
                ? "bg-rose-500/10 text-rose-500"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AdminNavigation;