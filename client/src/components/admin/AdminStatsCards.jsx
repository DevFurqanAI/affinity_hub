function AdminStatsCards({ stats }) {
  const cards = [
    {
      label: "Total Reports",
      value: stats.totalReports || 0,
      helper: "All submitted reports"
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports || 0,
      helper: "Waiting for review"
    },
    {
      label: "Action Taken",
      value: stats.actionTakenReports || 0,
      helper: "Reports with moderation action"
    },
    {
      label: "Rejected Reports",
      value: stats.rejectedReports || 0,
      helper: "Reports rejected by admin"
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-slate-500">{card.label}</p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {card.value}
          </p>

          <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
        </div>
      ))}
    </div>
  );
}

export default AdminStatsCards;