import {
  Ban,
  Flag,
  PauseCircle,
  ShieldCheck,
  UserMinus,
  UsersRound
} from "lucide-react";

function AdminStatsCards({ stats }) {
  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers || 0,
      helper: "Registered user accounts",
      icon: UsersRound,
      accent: "text-blue-500 bg-blue-500/10"
    },
    {
      label: "Active Users",
      value: stats.activeUsers || 0,
      helper: "Currently active",
      icon: ShieldCheck,
      accent: "text-emerald-500 bg-emerald-500/10"
    },
    {
      label: "Banned Users",
      value: stats.bannedUsers || 0,
      helper: "Restricted accounts",
      icon: Ban,
      accent: "text-rose-500 bg-rose-500/10"
    },
    {
      label: "Suspended Users",
      value: stats.suspendedUsers || 0,
      helper: "Temporary admin holds",
      icon: PauseCircle,
      accent: "text-amber-500 bg-amber-500/10"
    },
    {
      label: "Deactivated",
      value: stats.deactivatedUsers || 0,
      helper: "Hidden by account owner",
      icon: UserMinus,
      accent: "text-amber-500 bg-amber-500/10"
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports || 0,
      helper: "Awaiting moderation",
      icon: Flag,
      accent: "text-violet-500 bg-violet-500/10"
    },
    {
      label: "Active Bans",
      value: stats.activeBans || 0,
      helper: "Current restrictions",
      icon: Ban,
      accent: "text-rose-500 bg-rose-500/10"
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  {card.label}
                </p>

                <p className="mt-3 text-3xl font-black text-[var(--color-text)]">
                  {card.value}
                </p>

                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  {card.helper}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AdminStatsCards;