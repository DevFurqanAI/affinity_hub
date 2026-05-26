function Loader({ text = "Loading..." }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-6"
    >
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />

      {text ? (
        <p className="text-xs font-bold tracking-wide text-[var(--color-text-muted)]">
          {text}
        </p>
      ) : null}
    </div>
  );
}

export default Loader;