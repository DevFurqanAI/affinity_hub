import Button from "./Button.jsx";

function EmptyState({
  title = "Nothing here yet",
  message = "Content will appear here when available.",
  actionLabel,
  onAction,
  icon = "✨"
}) {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
        {icon}
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>

      {actionLabel && onAction ? (
        <div className="mt-5">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </section>
  );
}

export default EmptyState;