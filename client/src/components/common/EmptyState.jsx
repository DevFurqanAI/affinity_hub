import Button from "./Button.jsx";

function EmptyState({
  title = "Nothing here yet",
  message = "Content will appear here when available.",
  actionLabel,
  onAction,
  icon = "✨"
}) {
  return (
    <section className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500/15 via-pink-500/15 to-amber-500/20 text-2xl">
        {icon}
      </div>

      <h2 className="mt-4 text-base font-black tracking-tight text-[var(--color-text)]">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
        {message}
      </p>

      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </section>
  );
}

export default EmptyState;